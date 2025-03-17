const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail");
const { createNotification } = require("../config/Notification");

// signup
const userSignup = async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber, gender } = req.body;

    if (!name || !email || !password || !mobileNumber || !gender) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }

    let user = await User.findOne({ email });

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

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
        // Update OTP for email verification
        user.emailVerificationOtp = hashedOtp;
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

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      gender,
      emailVerificationOtp: hashedOtp,
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
    console.error("Error signing up user:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp.toString()).digest("hex");

    if (hashedOtp !== user.emailVerificationOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    if (typeof global.sendNotification === "function") {
      global.sendNotification(user._id, "New User Signed up", "signup");
    }

    return res.status(200).json({ success: true, message: "Email verified successfully!" });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Login successful", token,user });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error });
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
      `Your Password has been successfully changed on ${Date.now().toLocaleString()}`,
      "course"
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
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(402).json({
        success: false,
        message: "Your old password does not match the existing password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    global.sendNotification(
      user._id,
      `Your Password has been successfully updated on ${Date.now().toLocaleString()}`,
      "course"
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
