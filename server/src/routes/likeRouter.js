const express = require("express");
const { body } = require("express-validator");
const likeController = require("../controllers/likeController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/like", body("liked").isString().notEmpty(), isAuthenticated, likeController.addLike);
router.post("/test", body("liked").isString().notEmpty(), isAuthenticated, likeController.addLike);

router.delete("/delete/:username", isAuthenticated, likeController.unlikeUser);

router.get("/sent", isAuthenticated, likeController.getLikesSent);

router.get("/received", isAuthenticated, likeController.getLikesReceived);

module.exports = router;
