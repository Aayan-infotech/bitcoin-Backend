const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

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
    biometric: {
      biometricKey: {
        type: String,
        default: null,
      },
      biometricStatus: {
        type: Boolean,
        default: false,
      },
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
    level: { type: String },
    quizPoints: { type: Number, default: 0 },
    cryptoBalance: { type: String },
    mpinHash: { type: String }, // ✅ New field
    mpinResetOtp: { type: String, select: false },
    mpinResetExpires: { type: Date },
    linkedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    emailVerificationOtp: { type: String },
    emailVerificationExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    courseProgress: [
      { type: mongoose.Schema.Types.ObjectId, ref: "courseProgress" },
    ],
    Courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    Quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
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

// ✅ Add methods to set and verify MPIN
UserSchema.methods.setMPIN = async function (plainMPIN) {
  const salt = await bcrypt.genSalt(10);
  this.mpinHash = await bcrypt.hash(plainMPIN, salt);
};

UserSchema.methods.verifyMPIN = async function (plainMPIN) {
  return await bcrypt.compare(plainMPIN, this.mpinHash);
};

module.exports = mongoose.model("User", UserSchema);
