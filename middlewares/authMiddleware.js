const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { getSecrets } = require("../config/awsSecrets");

let secretsCache = null;

async function initSecrets() {
  if (!secretsCache) {
    secretsCache = await getSecrets();
  }
}

// Middleware: Authenticate any logged-in user
exports.auth = async (req, res, next) => {
  try {
    await initSecrets();

    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json({ success: false, message: "Token missing" });
    }

    try {
      req.user = jwt.verify(token, secretsCache.JWT_SECRET);
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Error validating token",
    });
  }
};

// Middleware: Ensure user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    await initSecrets();

    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json({ success: false, message: "Token missing" });
    }

    const userPayload = jwt.verify(token, secretsCache.JWT_SECRET);
    const user = await userModel.findById(userPayload.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.userType?.toLowerCase() !== "admin") {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to make this request!",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Admin check failed:", err);
    return res.status(500).json({
      success: false,
      message: "Error validating token or user role",
    });
  }
};
