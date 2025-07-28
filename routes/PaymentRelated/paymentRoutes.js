const express=require("express");
const router=express.Router()
const controller = require('../../controllers/WalletController/WalletController');
const { auth, isAdmin } = require("../../middlewares/authMiddleware");

router.post('/transfer',isAdmin, controller.sendCoins);
router.get('/transaction/:hash', controller.checkTransaction);
router.get('/balance/:address',isAdmin, controller.getUserBalance);
router.get('/pending-requests',isAdmin, controller.getPendingRewardClaims);
router.post('/approve-request/:userId',isAdmin, controller.approveClaim);
router.post('/transfer-users', auth, controller.sendCoinsUsers);
router.get('/transaction',auth, controller.getUserTransactionDetail);
// router.get('/balance-users/:address', controller.getUserBalanceNew);

module.exports =router;

