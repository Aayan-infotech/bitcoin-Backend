const express=require("express");
const router=express.Router()
const controller = require('../../controllers/WalletController/WalletController');
const { auth, isAdmin } = require("../../middlewares/authMiddleware");

router.post('/transfer',isAdmin, controller.sendCoins);
router.get('/transaction/:hash', controller.checkTransaction);
router.get('/balance/:address',isAdmin, controller.getUserBalance);
router.get('/pending-requests',isAdmin, controller.getPendingRewardClaims);
router.get('/approve-request:/claimId',isAdmin, controller.approveClaim);
router.post('/transfer-users', controller.sendCoinsUsers);
router.get('/balance-users/:address', controller.getUserBalanceNew);
router.post('/transaction/list', controller.getAllTransaction);

module.exports =router;

