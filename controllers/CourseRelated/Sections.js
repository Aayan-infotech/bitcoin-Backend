const Section = require("../../models/CourseRelated/CourseSectionsModel");

exports.createSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { courseId, title, description } = req.body;
    const video = req.files.video;

    // Check if all necessary fields are provided
    if (!courseId || !title || !description || !video) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" });
    }
    // console.log(uploadDetails);
    // Create a new sub-section with the necessary information
    const SectionDetails = await Section.create({
      title: title,
      timeDuration: `${video?.duration}`,
      description: description,
      videoUrl: video?.secure_url,
    });

    // Return the updated section in the response
    return res
      .status(200)
      .json({
        success: true,
        message: "Section Created Successfully",
        data: SectionDetails,
      });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
    try {
      const { sectionId, title, description } = req.body;
      const Section = await Section.findById(sectionId);
  
      if (!Section) {
        return res.status(404).json({
          success: false,
          message: "Section not found",
        });
      }
  
      if (title !== undefined) {
        Section.title = title;
      }
  
      if (description !== undefined) {
        Section.description = description;
      }
  
      await Section.save();
      const updatedSection = await Section.findById(quizId).populate(
        "Section"
      );
  
      return res.json({
        success: true,
        data: updatedSection,
        message: "Section updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      });
    }
  };
