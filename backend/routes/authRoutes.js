// Email verification route
router.post("/verify-email", authController.verifyEmail);
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Forgot password routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/profile", auth, authController.getProfile);
router.put("/profile", auth, authController.updateProfile);
router.post("/connect-platform", auth, authController.connectPlatform);

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
