const jwt = require("jsonwebtoken");
const JWT_KEY = "secrete";

module.exports = (req, res, next) => {
  try {
    const token = req.headers["token"];
    const verify_decoded = jwt.verify(token, JWT_KEY);
    req.userData = verify_decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Autorization failed"
    });
  }
};
