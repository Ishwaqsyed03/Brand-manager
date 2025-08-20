const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// Temporarily disable auth middleware
// const auth = require("../middlewares/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Make previously protected routes public temporarily
router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.post("/connect-platform", authController.connectPlatform);

// Social media connection routes (mock for now)
router.get("/connect/twitter", (req, res) => {
  res.json({ message: "Twitter connection endpoint - implement OAuth flow" });
});

router.get("/connect/linkedin", (req, res) => {
  res.json({ message: "LinkedIn connection endpoint - implement OAuth flow" });
});

router.get("/connect/instagram", (req, res) => {
  res.json({ message: "Instagram connection endpoint - implement OAuth flow" });
});

router.get("/connect/facebook", (req, res) => {
  res.json({ message: "Facebook connection endpoint - implement OAuth flow" });
});

module.exports = router;
