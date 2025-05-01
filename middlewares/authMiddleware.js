const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json({ success: false, message: "Token missing" });
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      return res.status(404).json({ success: false, message: "Invalid token" });
    }
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error validating token",
    });
  }
};
