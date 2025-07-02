const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { formatValidationError } = require("../helper/helper.js");


exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload) {
      req.user = payload;
      next();
    } else {
      res.status(401).json({ message: "You are not authorized" });
    }
  }
  catch (e) {
    console.log(e);
    res.status(401).json({ message: "You are not authorized" });
  }
};

exports.validateBody = (req, res, next) => {
  console.log("validateBody", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = formatValidationError(errors.array());
    console.log("CUSTOME ERROR MSG:",errorMsg);
    return res.status(400).json({ message: errorMsg });
  }
  next();
};
