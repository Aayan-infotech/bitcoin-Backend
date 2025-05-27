const express=require("express");
const router=express.Router()
const controller = require('../../controllers/WalletController/WalletController');
const { auth, isAdmin } = require("../../middlewares/authMiddleware");

router.post('/transfer',isAdmin, controller.sendCoins);
router.get('/transaction/:hash', controller.checkTransaction);
router.get('/balance/:address',isAdmin, controller.getUserBalance);

module.exports =router;

