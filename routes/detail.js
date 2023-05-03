const express = require('express')
const detail_JD = require('../controller/detail/jd')
const detail_TM = require('../controller/detail/tm')
const router = express.Router()

router.get('/JdGoodsInfo', detail_JD.getGoodsInfo)
router.get('/getJdCalculation', detail_JD.getCalculation)

router.get('/TmGoodsInfo', detail_TM.getgoodsInfo)
router.get('/getTmCalculation', detail_TM.getCalculation)
module.exports = router