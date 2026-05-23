const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const Itinerary = require("../models/Itinerary");
const { s3, isS3Configured } = require("../config/s3");

// GET /api/uploads/sign?key=...
// Re-issue a signed URL for a file owned by the logged-in user.
exports.signFileUrl = async (req, res, next) => {
  try {
    if (!isS3Configured()) {
      res.status(400);
      throw new Error("S3 is not configured on the server");
    }

    const { key } = req.query;
    if (!key) {
      res.status(400);
      throw new Error("Missing key");
    }

    // ownership check
    const owner = await Itinerary.findOne({
      user: req.user._id,
      "files.s3Key": key,
    }).select("_id");
    if (!owner) {
      res.status(404);
      throw new Error("File not found");
    }

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      }),
      { expiresIn: 3600 }
    );

    res.json({ url });
  } catch (err) {
    next(err);
  }
};
