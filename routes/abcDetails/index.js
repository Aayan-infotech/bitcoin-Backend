const express = require("express");
const cRoutes=require("./alphabets/C.routes")
const eRoutes=require("./alphabets/E.routes")

const router = express.Router();

router.use('/c',cRoutes )
router.use('/e',eRoutes )



module.exports = router;
