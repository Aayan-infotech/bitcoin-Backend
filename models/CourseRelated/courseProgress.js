const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedVideos: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    ],
    lastWatched: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // Tracks the last watched video
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
