require('dotenv').config();
const multer = require('multer');
const { S3 } = require('@aws-sdk/client-s3');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Initialize Secrets Manager Client
const secretsManagerClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

// Fetch AWS Credentials from Secrets Manager
const getAwsCredentials = async () => {
  try {
    const command = new GetSecretValueCommand({ SecretId: 'aayan-config' });
    const data = await secretsManagerClient.send(command);

    if (data.SecretString) {
      const secret = JSON.parse(data.SecretString);
      return {
        accessKeyId: secret.AWS_ACCESS_KEY_ID,
        secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
      };
    }
  } catch (error) {
    console.error('Error fetching secrets:', error);
  }
};

// Initialize S3 Client
const getS3Client = async () => {
  try {
    const credentials = await getAwsCredentials();

    return new S3({
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    console.error('Error initializing S3:', error.message);
    throw error;
  }
};

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize:50 * 1024 * 1024 }, // 5MB file size limit
}).array('files', 5); // Allows multiple files

// Middleware for Uploading Files to S3 (Always Calls Next)
const uploadToS3 = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      req.fileLocations = []; // No files uploaded, but move to next
      return next();
    }

    try {
      const s3 = await getS3Client();
      const fileLocations = [];

      for (const file of req.files) {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.putObject(params);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        fileLocations.push(fileUrl);
      }

      req.fileLocations = fileLocations;
      next();
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }
  });
};

module.exports = { uploadToS3 };
