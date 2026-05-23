const mongoose = require("mongoose");
const crypto = require("crypto");

const activitySchema = new mongoose.Schema(
  {
    time: String,
    title: String,
    description: String,
    type: {
      type: String,
      enum: ["flight", "hotel", "transport", "activity", "meal", "note"],
      default: "activity",
    },
    location: String,
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    date: String,
    summary: String,
    activities: [activitySchema],
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["flight", "hotel", "train", "bus", "car", "cruise", "activity", "other"],
      default: "other",
    },
    title: String,
    provider: String,
    reference: String,
    startDate: String,
    endDate: String,
    origin: String,
    destination: String,
    location: String,
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    originalName: String,
    mimeType: String,
    size: Number,
    s3Key: String,
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    destination: { type: String, trim: true },
    startDate: String,
    endDate: String,
    travelers: { type: Number, default: 1 },
    summary: String,
    bookings: [bookingSchema],
    days: [daySchema],
    tips: [String],
    files: [fileSchema],
    isPublic: { type: Boolean, default: false },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Itinerary", itinerarySchema);
