const express = require('express')
const jdChart = require('../controller/chart/jd')
const tmChart = require('../controller/chart//tm')
const router = express.Router()
const check = require('../middlewares/check')

router.get('/jd', check.checkUser,jdChart.getChart)
router.get('/jdCalculation', check.checkUser, jdChart.getCalculation)
router.get('/tm', check.checkUser,tmChart.getChart)
router.get('/tmCalculation', check.checkUser, tmChart.getCalculation)

module.exports = router