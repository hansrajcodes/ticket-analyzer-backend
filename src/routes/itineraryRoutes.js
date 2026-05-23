const express = require("express");

const {
  createItinerary,
  listItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  toggleShare,
  getSharedItinerary,
} = require("../controllers/itineraryController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// public
router.get("/share/:token", getSharedItinerary);

// protected
router.get("/", protect, listItineraries);
router.post("/", protect, upload.array("files", 8), createItinerary);
router.get("/:id", protect, getItinerary);
router.patch("/:id", protect, updateItinerary);
router.delete("/:id", protect, deleteItinerary);
router.post("/:id/share", protect, toggleShare);

module.exports = router;
