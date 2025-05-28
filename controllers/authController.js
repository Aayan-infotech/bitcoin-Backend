require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail");
const { sendNotification } = require("../config/pushNotification");
const { createWallet } = require("../service/etheriumService");
const { encrypt } = require("../utils/security");
const { getSecrets } = require("../config/awsSecrets");

const userSignup = async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber, gender, accountType } =
      req.body;

    if (!name || !email || !password || !mobileNumber || !gender) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    let user = await User.findOne({ email }).select("+password");
    const otp = "1111";

    const emailTemplate = (otp) => `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #007bff;">Email Verification OTP</h2>
        <p>Thank you for signing up. Please verify your email using the OTP below:</p>
        <h3 style="font-size: 24px; color: #28a745;">${otp}</h3>
        <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
        <hr/>
        <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    if (user) {
      if (!user.isEmailVerified) {
        user.emailVerificationOtp = otp;
        user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail(email, "Verify Your Email", emailTemplate(otp));

        return res.status(200).json({
          success: true,
          message:
            "Email is already registered but not verified. Verification OTP sent again.",
        });
      }
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const wallet = createWallet();
    const encryptedKey = encrypt(wallet.privateKey);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      gender,
      accountType: accountType || "Personal",
      wallet_address: wallet.address,
      private_key_encrypted: JSON.stringify(encryptedKey),
      emailVerificationOtp: otp,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000,
    });

    await newUser.save();
    await sendEmail(email, "Verify Your Email", emailTemplate(otp));

    return res.status(201).json({
      success: true,
      message: "User signup successful. Verification email sent.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (
      !user.emailVerificationOtp ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP expired. Please request a new one.",
        });
    }

    if (otp !== user.emailVerificationOtp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    try {
      sendNotification(user._id, "Signup successful", "security");
    } catch (err) {
      console.log(err.message);
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const secrets = await getSecrets();
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Email not verified" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secrets.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "User with this email is not registered with us.",
        });
    }

    // const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otp = "1111";
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #007bff;">Password Reset OTP</h2>
        <p>Your OTP for password reset is:</p>
        <h3 style="font-size: 24px; color: #28a745;">${otp}</h3>
        <p>Please use this OTP to update your password. It is valid for 10 minutes.</p>
        <hr/>
        <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, "Password Reset OTP", message);

    return res
      .status(201)
      .json({
        success: true,
        message: "Password reset OTP sent to your registered email.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (
      !user ||
      !user.resetPasswordOtp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or invalid" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.resetPasswordOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendNotification(
      user._id,
      `Your password has been successfully changed on ${new Date().toLocaleString()}`,
      "security"
    );

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Your old password does not match the existing password",
        });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendNotification(
      user._id,
      `Your password has been successfully updated on ${new Date().toLocaleString()}`,
      "security"
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const saveDeviceToken = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, { deviceToken: token });
    res.status(200).json({ success: true, message: "Token saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to save token" });
  }
};

const updateBiometric = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const passwordVerified = await bcrypt.compare(password, user.password);
    if (!passwordVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    user.biometricAuth = !user.biometricAuth;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Biometric authentication ${
        user.biometricAuth ? "Enabled" : "Disabled"
      }`,
    });
  } catch (err) {
    console.error("Error updating biometric:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  saveDeviceToken,
  userSignup,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateBiometric,
};
