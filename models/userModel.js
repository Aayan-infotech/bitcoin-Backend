const mongoose = require("mongoose");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String ,required:true,select:false},
    mobileNumber: { type: String },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    userType: {
      type: String,
      enum: ["Student", "Salaried","Admin","Self Employed"],
      default: "Student",
    },
    image: { type: String },
    wallet_address: {
      type: String,
      required:true,
      unique:true
    },
    private_key_encrypted: {
      type: String,
      required:true,
      unique:true
    },
    level: {
      type: String,
    },
    quizPoints: {
      type: String,
    },
    cryptoBalance: {
      type: String,
    },
    linkedCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],

    emailVerificationOtp: { type: String },
    emailVerificationExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress",
      },
    ],
    Courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    Quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],

    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isNew && !this.isEmailVerified) {
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in plain text
    this.emailVerificationOtp = otp;
    this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Email template
    const message = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="color: #007bff;">Email Verification OTP</h2>
        <p>Your email verification OTP is:</p>
        <h3 style="font-size: 24px; color: #28a745;">${otp}</h3>
        <p>Please complete your registration using this OTP.</p>
        <p style="color: red; font-weight: bold;">It is valid for 10 minutes.</p>
        <hr/>
        <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    // Send OTP via email
    await sendEmail(this.email, "Email Verification OTP", message);
  }

  next();
});


module.exports = mongoose.model("User", UserSchema);
