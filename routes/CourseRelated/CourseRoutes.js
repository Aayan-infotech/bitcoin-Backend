const { createCourse, getCourseDetails, editCourse, getAllCourses } = require("../../controllers/CourseRelated/CourseController");
const { updatecourseProgress, startCourse, getCoursesWithProgress } = require("../../controllers/CourseRelated/courseProgress");
const { createSection, deleteSection } = require("../../controllers/CourseRelated/Sections");
const { auth } = require("../../middlewares/authMiddleware");

const express=require("express")

const router=express.Router()
// ***************************** Course CRUD Routes************************************
router.post("/create-course",auth,createCourse)
router.get("/get-all-courses",getAllCourses)
router.get("/get-course-details/:courseId",getCourseDetails)
router.patch("/update-course/:courseId",editCourse)
// ***************************** Course CRUD Routes************************************



// ***************************** Section CRUD Routes************************************
router.post("/create-section",createSection)
router.delete("/delete-section/:sectionId",deleteSection)
// ***************************** Course CRUD Routes************************************


// ***************************** Course watching Routes************************************


router.post("/start-course", startCourse);
router.post("/update-progress",updatecourseProgress)
router.get("/get-user-course-progress/:userId",getCoursesWithProgress)



module.exports = router;  