const Section = require("../../models/CourseRelated/CourseSectionsModel");
const Course = require("../../models/CourseRelated/CourseModel");

exports.createSection = async (req, res) => {
  try {
    console.log("creating course",req.body)
    const { courseId, title, description } = req.body;
    const video = req?.files?.video;

    if (!courseId || !title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are Required" });
    }

    const newSection = await Section.create({
      title,
      timeDuration: video?.duration || 5, // Default if no duration available
      description,
      videoUrl: video?.secure_url || "file.url", // Default URL if no video
    });

    // Find the course and update its courseContent array
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    course.courseContent.push(newSection._id); // Push new section ID
    await course.save(); // Save the updated course

    const allUsers = await User.find({}, "_id"); // Fetch all users
    allUsers.forEach((user) =>
      global.sendNotification(
        user._id,
        `A new section "${title}" has been added to the "${course.courseName}"`,
        "course"
      )
    );

    return res.status(200).json({
      success: true,
      message: "Section Created Successfully and added to the course",
      data: newSection,
    });
  } catch (error) {
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
    const updatedSection = await Section.findById(quizId).populate("Section");

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

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params; // Get sectionId from URL params

    // Step 1: Find the course containing this section
    const course = await Course.findOne({ courseContent: sectionId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found for this section" });
    }

    // Step 2: Remove the section ID from courseContent array
    course.courseContent = course.courseContent.filter(
      (id) => id.toString() !== sectionId
    );
    await course.save();

    // Step 3: Delete the section from the database
    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section deleted and removed from course successfully",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
