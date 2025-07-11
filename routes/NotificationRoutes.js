const express = require("express");
const {  getAllNotifications,getUserNotifications,updateNotificationPreferences, createAdminPushNotification,deleteNotification,deleteUserNotification} = require('../controllers/Notificaton');
const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get('/all-notification', getAllNotifications);
router.get('/all-notification-ofUser',auth, getUserNotifications);
router.put('/update-user-notification-preference',auth, updateNotificationPreferences);
router.post('/create-notification',auth, createAdminPushNotification);
router.delete('/delete-all',auth, deleteUserNotification);
router.delete('/delete/:id',auth, deleteNotification);


module.exports = router;
