const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

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

exports.isAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json({ success: false, message: "Token missing" });
    }

    try {
      const userPayload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(userPayload.id);
      // console.log(user);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // if (user.userType?.toLowerCase() !== "admin") {
      //   return res.status(401).json({
      //     success: false,
      //     message: "You are not authorized to make this request!",
      //   });
      // }

      req.user = user; // optional, pass user forward
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    console.error("Middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Error validating token",
    });
  }
};
