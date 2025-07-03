const ODetails = require("../../models/AlphabetDetails/O.detailModel");

const createODetails = async (req, res) => {
  try {
    const { headline, subHeadLine } = req.body;
    const video = req.fileLocations[0];

    const newEntry = await ODetails.create({
      headline,
      subHeadLine,
      video,
    });

    return res.status(201).json({
      success: true,
      message: "E Details created successfully",
      data: newEntry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create E Details",
      error: error.message,
    });
  }
};

const getAllODetails = async (req, res) => {
  try {
    const entries = await ODetails.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All E Details fetched successfully",
      data: entries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching E Details",
      error: error.message,
    });
  }
};

module.exports={getAllODetails,createODetails}


