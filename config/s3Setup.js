require('dotenv').config();

const multer = require('multer');
const { S3 } = require('@aws-sdk/client-s3');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const path = require('path');

const secretsManagerClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

const getAwsCredentials = async () => {
  try {
    const command = new GetSecretValueCommand({ SecretId: 'atul-cred' });
    const data = await secretsManagerClient.send(command);

    if (data.SecretString) {
      const secret = JSON.parse(data.SecretString);
      return {
        accessKeyId: secret.AWS_ACCESS_KEY_ID,
        secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
      };
    }
  } catch (error) {
    console.error('Error fetching secrets:', error.message);
    throw new Error('Failed to retrieve AWS credentials');
  }
};

let s3;
(async () => {
  try {
    const credentials = await getAwsCredentials();
    s3 = new S3({
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    console.error('Error initializing S3:', error.message);
  }
})();

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true);
  } else if (!extname) {
    cb(new Error('File type not allowed. Only JPEG, JPG, PNG are allowed.'));
  } else {
    cb(new Error('Only images and videos are allowed.'));
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
}).array('images', 10);

const uploadToS3 = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send(err.message);
    }

    try {
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
