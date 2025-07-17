require("dotenv").config();
const multer = require("multer");
const { S3 } = require("@aws-sdk/client-s3");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const secretsManagerClient = new SecretsManagerClient({
  region: "us-east-1", // Secrets Manager region
});

// Fetch AWS credentials and config
const getAwsCredentials = async () => {
  const command = new GetSecretValueCommand({
    SecretId: process.env.AWS_SECRET_NAME || "bit-vault",
  });

  const data = await secretsManagerClient.send(command);

  if (!data.SecretString) {
    throw new Error("No secret string returned from AWS Secrets Manager");
  } 

  const secret = JSON.parse(data.SecretString);

    return {
    accessKeyId: secret.AWS_ACCESS_KEY_ID,
    secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
    bucketName: secret.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME, // fallback to env
    region: secret.AWS_REGION || process.env.AWS_REGION || "us-east-1", // fallback
  };
};

// Create the S3 client instance
const getS3Client = async () => {
  const credentials = await getAwsCredentials();

  const s3Client = new S3({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    region: credentials.region,
  });

  return { s3Client, config: credentials };
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
      const { s3Client, config } = await getS3Client();
      const fileLocations = [];

      for (const file of req.files) {
        const fileKey = `${Date.now()}-${file.originalname}`;
        const params = {
          Bucket: config.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3Client.putObject(params);

        const fileUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${fileKey}`;
        fileLocations.push(fileUrl);
      }

      req.fileLocations = fileLocations;
      next();
    } catch (uploadError) {
      console.error("Upload Error:", uploadError);
      return res.status(500).json({ success: false, error: uploadError.message });
    }
  });
};

module.exports = { uploadToS3 };
