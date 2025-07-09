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
      enum: ["Personal", "Business", "Admin"],
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
    level: { type: Number, default: 1 },
    quizPoints: { type: Number, default: 0 },
    videoPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    claimedRewards: [
      {
        level: Number,
        activity: String, // 'quiz' or 'video'
        claimedAt: { type: Date, default: Date.now },
      },
    ],

    cryptoBalance: { type: String },
    mpinHash: { type: String },
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
    lastLoginIP: { type: String },
    lastUserAgent: { type: String },
    notificationPreferences: {
      promotional: { type: Boolean, default: true },
      wallet: { type: Boolean, default: true },
      transaction: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },

    businessInfo: {
      businessName: { type: String },
      businessTaxId: { type: String },
      businessCountry: { type: String },
      businessAddress: { type: String },
      city: { type: String },
      province: { type: String },
      postalCode: { type: String },
      addressDocument: { type: String },
    },

    beneficialOwner: {
      fullName: { type: String },
      dob: { type: Date },
      address: { type: String },
      ownershipPercentage: { type: String },
      governmentID: { type: String },
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
