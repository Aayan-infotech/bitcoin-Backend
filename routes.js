const express = require("express");
const router = express.Router();
const authRoutes = require("./routes/authRoute");
const alphabet = require("./routes/alphabetRoutes");
const faq = require("./routes/FaqRoutes");
const notification = require("./routes/NotificationRoutes");
const quizRoutes = require("./routes/QuizRelated/quizRoutes");
const courseRoutes = require("./routes/CourseRelated/CourseRoutes");
const userRoutes = require("./routes/UserRoutes/userRoutes");

router.use("/auth", authRoutes);
router.use("/alphabet", alphabet);
router.use("/faq", faq);
router.use("/notification", notification);
router.use("/quiz", quizRoutes);
router.use("/course", courseRoutes);
router.use("/user",userRoutes);

module.exports = router;
