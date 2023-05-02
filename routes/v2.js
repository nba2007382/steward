const express = require('express')
const pages_JD = require('../controller/v2/pags_JD')
const pages_TM = require('../controller/v2/pags_TM')
const router = express.Router()

router.get('/JdGoodsInfo', pages_JD.getgoodsInfo)
router.get('/getJdCalculation', pages_JD.getCalculation)

router.get('/TmGoodsInfo', pages_TM.getgoodsInfo)
router.get('/getTmCalculation', pages_TM.getCalculation)
module.exports = router