const express=require("express");
const { auth } = require("../../middlewares/authMiddleware");
const { sendCoins } = require("../../controllers/PaymentsRelated/TransactionController");
const router=express.Router()

router.post("/send", auth, sendCoins);

module.exports =router;

