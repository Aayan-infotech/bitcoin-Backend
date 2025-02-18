const { createCourse, getCourseDetails, editCourse, getAllCourses } = require("../../controllers/CourseRelated/CourseController");
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




module.exports = router;  