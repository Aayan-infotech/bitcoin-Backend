const express=require("express");
const router=express.Router()
const controller = require('../../controllers/WalletController/WalletController');

router.post('/transfer', controller.sendCoins);
router.get('/transaction/:hash', controller.checkTransaction);
router.get('/balance/:address', controller.getUserBalance);

module.exports =router;

