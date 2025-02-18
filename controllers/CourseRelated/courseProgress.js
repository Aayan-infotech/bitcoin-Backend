const Section =require("../../models/CourseRelated/CourseSectionModel")
const courseProgress =require("../../models/CourseRelated/courseProgress")


exports.updateCourseProgress = async (req, res) => {
    const { courseId, SectionId } = req.body
    const userId = req.user.id

    try {
      // Check if the Section is valid
      const updateSection = await Section.findById(SectionId)
      if (!updateSection) {
        return res.status(404).json({ error: "Invalid Section" })
      }
  
      // Find the course progress document for the user and course
      let courseProgressUser = await courseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      if (!courseProgressUser) {
        // If course progress doesn't exist, create a new one
        return res.status(404).json({
          success: false,
          message: "Course progress Does Not Exist",
        })
      } else {
        // If course progress exists, check if the Section is already completed
        if (courseProgressUser.completedVideos.includes(SectionId)) {
          return res.status(400).json({ error: "Section already completed" })
        }
  
        // Push the Section into the completedVideos array
        courseProgressUser.completedVideos.push(SectionId)
      }
  
      // Save the updated course progress
      await courseProgressUser.save()
  
      return res.status(200).json({ message: "Course progress updated" })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }