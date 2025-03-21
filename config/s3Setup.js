require("dotenv").config();
const multer = require("multer");
const { S3 } = require("@aws-sdk/client-s3");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// Initialize AWS Secrets Manager
const secretsManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

// Fetch AWS credentials from Secrets Manager
const getAwsCredentials = async () => {
  try {
    const command = new GetSecretValueCommand({ SecretId: "aws-secret" });
    const data = await secretsManagerClient.send(command);

    if (data.SecretString) {
      const secret = JSON.parse(data.SecretString);
      return {
        accessKeyId: secret.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:
          secret.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
      };
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Failed while fetching credentials",
    });
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
    return res.status(403).json({
      success: false,
      message: "Failed while fetching credentials",
    });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("files", 5); 

const uploadToS3 = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      req.fileLocations = [];
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
      return res.status(500).send(uploadError.message);
    }
  });
};

module.exports = { uploadToS3 };
