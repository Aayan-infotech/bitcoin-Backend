const express = require("express");
const cRoutes=require("./alphabets/C.routes")
const eRoutes=require("./alphabets/E.routes")
const oRoutes=require("./alphabets/O.routes")
const hRoutes=require("../../controllers/AlphabetDetails/H.detailController")

const router = express.Router();

router.use('/c',cRoutes )
router.use('/e',eRoutes )
router.use('/h',hRoutes )
router.use('/o',oRoutes )



module.exports = router;
