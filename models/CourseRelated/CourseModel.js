const mongoose = require("mongoose");

// Define the Course schema
const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseDescription: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  thumbnail: { type: String },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
  },
});

module.exports = mongoose.model("Course", courseSchema);
