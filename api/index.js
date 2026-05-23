const app = require("../src/app");
const connectDB = require("../src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connect failed:", err.message);
    res.status(500).json({ message: "Database connection failed" });
    return;
  }
  return app(req, res);
};
