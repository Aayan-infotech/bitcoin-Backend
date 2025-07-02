const express = require("express");
const cRoutes=require("./alphabets/C.routes")

const router = express.Router();

router.use('/c',cRoutes )



module.exports = router;
