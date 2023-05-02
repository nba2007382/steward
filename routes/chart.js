const express = require('express')
const jdChart = require('../controller/chart/jd')
const tmChart = require('../controller/chart//tm')
const router = express.Router()
const check = require('../middlewares/check')

router.get('/jd', check.checkuser,jdChart.getchart)
router.get('/jdCalculation', check.checkuser, jdChart.getCalculation)
router.get('/tm', check.checkuser,tmChart.getchart)
router.get('/tmCalculation', check.checkuser, tmChart.getCalculation)

module.exports = router