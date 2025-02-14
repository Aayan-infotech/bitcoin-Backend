const express = require("express");
const {  getAllNotifications,getAllNotificationsByuserId} = require('../controllers/Notificaton');

const router = express.Router();

router.get('/all-notification', getAllNotifications);
router.get('/all-notification-ofUser/:id', getAllNotificationsByuserId);


module.exports = router;
