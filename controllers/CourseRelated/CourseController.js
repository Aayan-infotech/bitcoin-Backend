const Course = require("../../models/CourseRelated/CourseModel");
const Section = require("../../models/CourseRelated/CourseSectionsModel");
const User = require("../../models/userModel");

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseName, courseDescription,  status } = req.body;

    if (!courseName || !courseDescription || !price ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are mandatory" });
    }

    const instructor = await User.findById(userId);
    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found" });
    }
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructor._id,
      price,
      // thumbnail: thumbnail,
      status: status || "Draft",
    });

    // instructor.courses.push(newCourse._id);
    await instructor.save();
    const allUsers = await User.find({}, "_id"); // Fetch all users
    allUsers.forEach((user) =>
      global.sendNotification(user._id, `A new course "${courseName}" has been added.`, "course")
    );

    res
      .status(200)
      .json({
        success: true,
        data: newCourse,
        message: "Course created successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create course",
        error: error.message,
      });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({});
    ;
    res.status(200).json({ success: true, data: allCourses });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch courses",
        error: error.message,
      });
  }
};

// Get course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Find the course and populate instructor & courseContent (which further populates Sections)
    const courseDetails = await Course.findById(courseId)
      .populate("instructor", "name email") // Populate instructor with selected fields
      .populate({
        path: "courseContent",
        model: "Section",
      });

    if (!courseDetails) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: courseDetails });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
      error: error.message,
    });
  }
};


// Edit course
exports.editCourse = async (req, res) => {
  try {
    const {courseId}=req.params
    const {  ...updates } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }


    Object.assign(course, updates);
    await course.save();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await User.updateMany(
      { _id: { $in: course.studentsEnrolled } },
      { $pull: { courses: courseId } }
    );
    await Section.deleteMany({ _id: { $in: course.courseContent } });
    await Course.findByIdAndDelete(courseId);

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
