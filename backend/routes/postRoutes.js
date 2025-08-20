const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
// const auth = require("../middlewares/auth"); // Commented out auth middleware

// All routes are now public (no authentication required)
// router.use(auth); // Commented out auth requirement

// CRUD operations
router.post("/", postController.createPost);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

// Special operations
router.post("/manual", postController.handleManualPost);
router.post("/:id/schedule", postController.schedulePost);

module.exports = router;
