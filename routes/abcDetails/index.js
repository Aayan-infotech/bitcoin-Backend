const express = require("express");
const cRoutes=require("./alphabets/C.routes")
const eRoutes=require("./alphabets/E.routes")
const hRoutes=require("../../controllers/AlphabetDetails/H.detailController")

const router = express.Router();

router.use('/c',cRoutes )
router.use('/e',eRoutes )
router.use('/h',hRoutes )



module.exports = router;
