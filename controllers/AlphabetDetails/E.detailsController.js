const EDetails = require("../../models/AlphabetDetails/E.detailsModel");

const createEDetails = async (req, res) => {
  try {
    const { headline, subHeadLine } = req.body;
    const images = req.fileLocations; // Assume fileLocations is an array of image URLs

    const newEntry = await EDetails.create({
      headline,
      subHeadLine,
      images,
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

const getAllEDetails = async (req, res) => {
  try {
    const entries = await EDetails.find().sort({ createdAt: -1 });

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

module.exports={getAllEDetails,createEDetails}


