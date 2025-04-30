const express = require("express");
const {  getAllNotifications,getUserNotifications,updateNotificationPreferences} = require('../controllers/Notificaton');
const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get('/all-notification', getAllNotifications);
router.get('/all-notification-ofUser',auth, getUserNotifications);
router.put('/update-user-notification-preference',auth, updateNotificationPreferences);


module.exports = router;
