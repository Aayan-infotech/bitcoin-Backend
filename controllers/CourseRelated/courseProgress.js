const Section =require("../../models/CourseRelated/CourseSectionsModel")
const Course =require("../../models/CourseRelated/CourseModel")
const courseProgress =require("../../models/CourseRelated/courseProgress")
const User =require("../../models/userModel");
const { convertSecondsToDuration } = require("../../utils/convertSecondsToTime");

exports.startCourse = async (req, res) => {
  try {
      const { userId, courseId } = req.body;
      console.log(userId, courseId )
      if (!userId || !courseId) {
          return res.status(400).json({ success: false, message: "User ID and Course ID are required." });
      }

      // Find the user
      let user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      // Add course to user's enrolled courses if not already present
      if (!user.Courses.includes(courseId)) {
          user.Courses.push(courseId);
          await user.save();
      }

      // Check if progress already exists
      let progress = await courseProgress.findOne({ userId, courseId });

      if (!progress) {
          progress = new courseProgress({
              userId,
              courseId,
              progress: 0, // Initial progress is 0%
          });
        }
          await progress.save();

      return res.status(200).json({
          success: true,
          message: "Course started successfully.",
          progress,
          userCourses: user.Courses, // Returning updated enrolled courses for debugging
      });
  } catch (error) {
      console.error("Error starting course:", error);
      res.status(500).json({ success: false, message: "Error starting course.", error });
  }
};



exports.updatecourseProgress = async (req, res) => {
  try {
    const { userId, courseId, SectionId } = req.body;

    let progress = await courseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new courseProgress({ userId, courseId, completedVideos: [], lastWatched: SectionId });
    }

    // Add subsection if not already completed
    if (!progress.completedVideos.includes(SectionId)) {
      progress.completedVideos.push(SectionId);
    }

    progress.lastWatched = SectionId;

    await progress.save();

    res.status(200).json({ success: true, message: "Progress updated", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating progress", error });
  }
};

exports.getCoursesWithProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all available courses
    const allCourses = await Course.find().populate("courseContent");

    if (!allCourses.length) {
      return res.status(404).json({ success: false, message: "No courses found" });
    }

    const userProgress = await courseProgress.find({ userId });

    const courseData = allCourses.map((course) => {
      const totalSections = course.courseContent.length;
      const totalDurationInSeconds = course.courseContent.reduce(
        (acc, section) => acc + parseInt(section.timeDuration || 0),
        0
      );

      // Find user progress for this course
      const progress = userProgress.find((p) => p.courseId.toString() === course._id.toString());

      let progressPercentage = "New Course"; // Default if user hasn't started

      if (progress) {
        const completedCount = progress.completedVideos.length;
        progressPercentage =
          totalSections > 0 ? `${((completedCount / totalSections) * 100).toFixed(2)}%` : "100%";
      }

      return {
        courseId: course._id,
        courseName: course.courseName,
        totalSections,
        progressPercentage,
        totalDuration: convertSecondsToDuration(totalDurationInSeconds),
      };
    });

    return res.status(200).json({ success: true, courses: courseData });
  } catch (error) {
    console.error("Error fetching courses with progress:", error);
    return res.status(500).json({ success: false, message: "Error fetching courses", error });
  }
};



