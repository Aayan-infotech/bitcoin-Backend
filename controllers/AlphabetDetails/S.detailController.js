const sDetail = require("../../models/AlphabetDetails/S.DetailModel");

const createSatoshi = async (req, res) => {
  try {
    const video = req.fileLocations[0];

    const existing = await sDetail.findOne();

    let result;
    if (existing) {
      existing.video = video;
      result = await existing.save();
    } else {
      result = await sDetail.create({ video });
    }

    res.status(200).json({
      success: true,
      message: existing ? "Satoshi video updated" : "Satoshi video created",
      data: result,
    });
  } catch (error) {
    console.error("Error in createSatoshi:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getSatoshi = async (req, res) => {
  try {

    const existing = await sDetail.findOne();

    res.status(200).json({
      success: true,
      message: existing ? "Satoshi video updated" : "Satoshi video created",
      data: existing,
    });
  } catch (error) {
    console.error("Error in createSatoshi:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createSatoshi,getSatoshi };
