const Section = require("../../models/CourseRelated/CourseSectionsModel");
const Course = require("../../models/CourseRelated/CourseModel");
const User = require("../../models/userModel");

exports.createSection = async (req, res) => {
  try {
    const { courseId, title, description, timeDuration } = req.body;

    if (!courseId || !title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are Required" });
    }
    let videoUrl;
    if (req.fileLocations[0]) {
      videoUrl = req.fileLocations[0];
    }

    const newSection = await Section.create({
      title,
      timeDuration: timeDuration,
      description,
      videoUrl: videoUrl || "file.url", 
    });

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
        "promotional"
      )
    );

    return res.status(200).json({
      success: true,
      message: "Section Created Successfully and added to the course",
      data: newSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { sectionId } = req.params;
    const SectiontoUpdate = await Section.findById(sectionId);

    if (!SectiontoUpdate) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    if (title !== undefined) {
      SectiontoUpdate.title = title;
    }

    if (description !== undefined) {
      SectiontoUpdate.description = description;
    }
    if (req.fileLocations[0]) {
      SectiontoUpdate.videoUrl = req.fileLocations[0];
    }
    await SectiontoUpdate.save();
    const updatedSection = await Section.findById(sectionId);

    return res.json({
      success: true,
      data: updatedSection,
      message: "Section updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params; // Get sectionId from URL params

    const course = await Course.findOne({ courseContent: sectionId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found for this section" });
    }

    course.courseContent = course.courseContent.filter(
      (id) => id.toString() !== sectionId
    );
    await course.save();

    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section deleted and removed from course successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
