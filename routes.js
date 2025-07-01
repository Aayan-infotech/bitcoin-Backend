const express = require("express");
const router = express.Router();
const authRoutes = require("./routes/authRoute");
const alphabet = require("./routes/alphabetRoutes");
const faq = require("./routes/FaqRoutes");
const notification = require("./routes/NotificationRoutes");
const quizRoutes = require("./routes/QuizRelated/quizRoutes");
const courseRoutes = require("./routes/CourseRelated/CourseRoutes");
const userRoutes = require("./routes/UserRoutes/userRoutes");
const cardRoutes = require("./routes/PaymentRelated/CardsRoutes");
const deviceRoutes = require("./routes/deviceTokenRoutes");
const paymentRoutes = require("./routes/PaymentRelated/paymentRoutes");
const albhabetDetails = require("./routes/abcDetails/index");

router.use("/auth", authRoutes);
router.use("/alphabet", alphabet);
router.use("/faq", faq);
router.use("/notification", notification);
router.use("/quiz", quizRoutes);
router.use("/course", courseRoutes);
router.use("/user",userRoutes);
router.use("/card",cardRoutes);
router.use("/device-token",deviceRoutes);
router.use("/payment",paymentRoutes);
router.use("/abc",albhabetDetails);

module.exports = router;
