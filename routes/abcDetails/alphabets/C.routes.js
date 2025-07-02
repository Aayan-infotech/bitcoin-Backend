const express =require("express");
const { createPoll, getPoll ,votePoll} = require("../../../controllers/AlphabetDetails/CdetailController");
const { auth } = require("../../../middlewares/authMiddleware");

const router=express.Router();

router.post("/create-poll",auth,createPoll)
router.post("/poll/:pollId",auth,votePoll)
router.get("/polls/:pollId",getPoll)

module.exports=router;