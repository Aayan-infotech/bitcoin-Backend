const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  hashtags: [String],
  options: [
    {
      text: String,
      voteCount: { type: Number, default: 0 },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  votes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      selectedOption: Number, 
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Poll", pollSchema);
