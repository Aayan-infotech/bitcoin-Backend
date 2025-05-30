const { uploadToS3 } = require("../../config/s3Setup");
const { createCourse, getCourseDetails, editCourse, getAllCourses, updateCourseStatus, deleteCourse, searchCourse } = require("../../controllers/CourseRelated/CourseController");
const { updatecourseProgress, startCourse, getCoursesWithProgress, getCourseProgressForUser } = require("../../controllers/CourseRelated/courseProgress");
const { createSection, deleteSection, updateSection } = require("../../controllers/CourseRelated/Sections");
const { auth } = require("../../middlewares/authMiddleware");

const express=require("express")

const router=express.Router()
// ***************************** Course CRUD Routes************************************
router.post("/create-course",auth,uploadToS3,createCourse)
router.get("/get-all-courses",getAllCourses)
router.get("/get-course-details/:courseId",getCourseDetails)
router.patch("/update-course/:courseId",editCourse)
router.patch("/update-course-status/:courseId",updateCourseStatus)
router.delete("/delete-course/:courseId",deleteCourse)

router.get("/search",searchCourse)


// ***************************** Section CRUD Routes************************************
router.post("/create-section",uploadToS3,createSection)
router.patch("/update-section/:sectionId",uploadToS3,updateSection)
router.delete("/delete-section/:sectionId",deleteSection)
// ***************************** Course CRUD Routes************************************


// ***************************** Course watching Routes************************************


router.post("/start-course", startCourse);
router.post("/update-progress",updatecourseProgress)
router.get("/get-user-course-progress/:userId/:courseId",getCourseProgressForUser)
// router.get("/get-user-course-progress/:userId",getCoursesWithProgress)



module.exports = router;  