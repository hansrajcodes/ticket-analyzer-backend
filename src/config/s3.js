const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const isS3Configured = () => {
  const id = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET;
  return Boolean(
    id && !id.startsWith("YOUR_") &&
    secret && !secret.startsWith("YOUR_") &&
    bucket && !bucket.startsWith("your-")
  );
};

module.exports = { s3, isS3Configured };
