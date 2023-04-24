const express = require('express')
const pages_JD = require('../controller/v2/pags_JD')
const router = express.Router()

router.get('/goodsInfo', pages_JD.getgoodsInfo)
router.get('/getPagination', pages_JD.getPagination)
router.get('/getCalculation', pages_JD.getCalculation)
module.exports = router