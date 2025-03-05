const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      message: "Users fetched Successfully",
      users,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error Occured while fetching all the users",
    });
  }
};
const updateProfile = async (req, res) => {
    try {
      const userId = req.params.id;
      const image=req.fileLocations[0]
      const { mobileNumber, name, gender } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      if (mobileNumber) user.mobileNumber = mobileNumber;
      if (name) user.name = name;
      if (gender) user.gender = gender;
      if (image) user.image = image;
      
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User data updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating user profile",
        error: error.message,
      });
    }
  };
  

module.exports = { getAllUsers,updateProfile };
