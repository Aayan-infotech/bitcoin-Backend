const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const secretName = process.env.USER || "aws-secret"; // stored in AWS
const region = process.env.AWS_REGION || "us-east-1"; // adjust as needed

let cachedSecrets = null;

const getSecrets = async () => {
  if (cachedSecrets) return cachedSecrets;

  const client = new SecretsManagerClient({ region });

  try {
    const data = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );

    if ("SecretString" in data) {
      cachedSecrets = JSON.parse(data.SecretString);
      return cachedSecrets;
    } else {
      throw new Error("SecretBinary not supported.");
    }
  } catch (err) {
    console.error("Failed to fetch secrets from AWS:", err.message);
    throw err;
  }
};

module.exports = { getSecrets };
