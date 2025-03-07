const {addCards}=require("../../controllers/PaymentsRelated/PaymentMethod")

const express=require("express");
const router=express.Router()

router.post("/add-card",addCards)

module.exports =router