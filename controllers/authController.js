const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail");
const { createNotification } = require("../config/Notification");

// signup
const userSignup = async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    if (!name || !email || !password || !mobileNumber) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
    });

    await newUser.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "User Signup Successfully",
      newUser,
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res
      .status(500)
      .json({ success: false, status: 500, message: "Something went wrong" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body; // Get email & OTP from request

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Check if OTP is expired
    if (
      !user.emailVerificationOtp ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Hash the entered OTP and compare with the stored hash
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.emailVerificationOtp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // OTP is correct → Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined; // Clear OTP after successful verification
    user.emailVerificationExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: "Email not verified" });
    }

    // Compare passwords
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3h" } // Token expires in 7 days
    );

    // Set token in HTTP-only cookie (safer than localStorage)
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { login };


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email is not registered with us.",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    existingUser.resetPasswordOtp = hashedOtp;
    existingUser.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await existingUser.save();

    // 🔹 Email message
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

    // 🔹 Send OTP email
    await sendEmail(email, "Password Reset OTP", message);

    return res.status(201).json({
      success: true,
      message: "Password reset OTP sent to your registered email.",
    });
  } catch (error) {
    console.log("Forgot Password Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
// Reset Password

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // 🔹 Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 🔹 Check if OTP exists & is not expired
    if (!user.resetPasswordOtp || user.resetPasswordExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or invalid" });
    }

    // 🔹 Hash input OTP for comparison
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 🔹 Compare OTPs
    if (hashedOtp !== user.resetPasswordOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update password & clear OTP fields
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    global.sendNotification(
      user._id,
      `Your Password has been successfully changed on ${Date.now().toLocaleString()}`,
      "course"
    )

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
    // 🔹 Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔹 Compare old password correctly
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(402).json({
        success: false,
        message: "Your old password does not match the existing password",
      });
    }

    // 🔹 Hash the new password and update it
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // 🔹 Send notification
    global.sendNotification(
      user._id,
      `Your Password has been successfully updated on ${Date.now().toLocaleString()}`,
      "course"
    )

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
