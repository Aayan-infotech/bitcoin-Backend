require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail");
const { createNotification } = require("../config/Notification");
const { createWallet } = require("../utils/BlockChainService");



const encryptPrivateKey = (privateKey) => {
    const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_SECRET);
    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};
const decryptPrivateKey = (encryptedPrivateKey) => {
  const decipher = crypto.createDecipher("aes-256-cbc", process.env.ENCRYPTION_SECRET);

  let decrypted = decipher.update(encryptedPrivateKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
// signup
const userSignup = async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber, gender } = req.body;

    if (!name || !email || !password || !mobileNumber || !gender) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    let user = await User.findOne({ email });

    // Generate OTP (4-digit numeric)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

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
        user.emailVerificationOtp = otp; // Store OTP as plain text
        user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        await sendEmail(email, "Verify Your Email", emailTemplate(otp));

        return res.status(200).json({
          success: true,
          message: "Email is already registered but not verified. Verification OTP sent again.",
        });
      }
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create wallet
    const wallet = createWallet();
    if (!wallet.publicKey || !wallet.privateKey) {
      throw new Error("Wallet generation failed");
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      gender,
      wallet_address: wallet.publicKey,
      private_key_encrypted: encryptPrivateKey(wallet.privateKey),
      emailVerificationOtp: otp, 
      emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    await newUser.save();
    await sendEmail(email, "Verify Your Email", emailTemplate(otp));

    return res.status(200).json({
      success: true,
      message: "User Signup Successful. Verification email sent.",
      newUser,
    });

  } catch (error) {
    return res.status(500).json({ success: false,error, message: "Something went wrong" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Check if OTP is expired
    if (!user.emailVerificationOtp || !user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // Compare OTPs directly
    if (otp !== user.emailVerificationOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    if (typeof global.sendNotification === "function") {
      global.sendNotification(user._id, "New User Signed up", "security");
    }

    return res.status(200).json({ success: true, message: "Email verified successfully!" });

  } catch (error) {
    return res.status(500).json({ success: false,error, message: "Internal server error" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
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

    // Compare passwords
    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email is not registered with us.",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    existingUser.resetPasswordOtp = hashedOtp;
    existingUser.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await existingUser.save();

    const message = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #007bff;">Password Reset OTP</h2>
        <p>Your OTP for password reset is:</p>
        <h3 style="font-size: 24px; color: #28a745;">${otp}</h3>
        <p>Please use this OTP to update your password.</p>
        <p style="color: red; font-weight: bold;">It is valid for 10 minutes.</p>
        <hr/>
        <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, "Password Reset OTP", message);

    return res.status(201).json({
      success: true,
      otp,
      message: "Password reset OTP sent to your registered email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or invalid" });
    }

    // const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // if (hashedOtp !== user.resetPasswordOtp) {
    //   return res.status(400).json({ success: false, message: "Invalid OTP" });
    // }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    global.sendNotification(
      user._id,
      `Your Password has been successfully changed on ${new Date(Date.now()).toLocaleString()}`,
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
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Your old password does not match the existing password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    global.sendNotification(
      user._id,
      `Your Password has been successfully updated on ${Date.now().toLocaleString()}`,
      "security"
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  userSignup,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
};
