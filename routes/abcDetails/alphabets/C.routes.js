const express =require("express");
const { createPoll, getPoll ,votePoll} = require("../../../controllers/AlphabetDetails/CdetailController");

const router=express.Router();

router.post("/create-poll",createPoll)
router.post("/poll/:pollId",votePoll)
router.get("/polls/:pollId",getPoll)

module.exports=router;