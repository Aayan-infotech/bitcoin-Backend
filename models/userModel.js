const mongoose = require("mongoose");
const crypto = require("crypto");
const sendEmail = require("../config/sendMail");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    mobileNumber: { type: String },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    biometricAuth: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ["Personal", "Business", "Other", "Admin"],
      default: "Personal",
    },
    image: { type: String, default: null },
    wallet_address: {
      type: String,
      required: true,
      unique: true,
    },
    private_key_encrypted: {
      type: String,
      required: true,
      unique: true,
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
    deviceToken: { type: String },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
    notificationPreferences: {
      promotional: { type: Boolean, default: true },
      wallet: { type: Boolean, default: true },
      transaction: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
