const express = require("express");
const { body } = require("express-validator");
const blockController = require("../controllers/blockController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", body("username").isString().notEmpty(), isAuthenticated, blockController.addBlock);
router.post("/signal", body("username").isString().notEmpty(), isAuthenticated, blockController.addSignalement);

router.delete("/delete/:username", isAuthenticated, blockController.deleteBlock);

router.get("/", isAuthenticated, blockController.getBlockedUsers);

module.exports = router;
