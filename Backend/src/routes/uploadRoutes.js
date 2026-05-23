const express = require("express");
const { signFileUrl } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sign", protect, signFileUrl);

module.exports = router;
