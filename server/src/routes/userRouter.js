var express = require("express");
var router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { isAuthenticated, validateBody } = require("../middlewares/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 } // 5MB file size limit
}).fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'pictures[]', maxCount: 5 }
]);

router.get("/", function (req, res) {
  res.send("respond with a resource");
});

router.get("/all", isAuthenticated, userController.getUsers);

router.get("/isMatch/:username", isAuthenticated, userController.isMatch);

router.get("/me", isAuthenticated, userController.getMe);
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error("Multer error:", err);
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    console.error("Unknown upload error:", err);
    return res.status(500).json({
      success: false,
      message: "File upload failed"
    });
  }
  // No error
  next();
};

function multerError(req, res, next) {
  upload(req, res, function(err) {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}

router.put(
  "/profile",
  isAuthenticated,
  multerError,
  body("gender").isIn(["male", "female", "other"]).notEmpty().withMessage("Gender is required"),
  body("sexual_preferences").isArray().notEmpty().withMessage("sexual_preferences are required"),
  body("biography").isString().trim().notEmpty().withMessage("Biography is required"),
  body("authorize_location").isBoolean().notEmpty().withMessage("Location authorization is required"),
  body("interests").isArray().notEmpty().withMessage("Interests are required"),
  // body("location").isObject({
  //   latitude: { isFloat: true, notEmpty: true },
  //   longitude: { isFloat: true, notEmpty: true },
  //   country: { isString: true, notEmpty: true },
  //   city: { isString: true, notEmpty: true },
  // }).notEmpty().withMessage("Location is required"),
  userController.updateUser
);

router.post("/view/:username", isAuthenticated, userController.viewUser);

router.get("/:username", isAuthenticated, userController.getUser);

router.put("/filter", isAuthenticated, userController.updateUserFilter);

module.exports = router;