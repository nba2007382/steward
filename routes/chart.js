const express = require('express')
const chart = require('../controller/chart/jd')
const router = express.Router()
const check = require('../middlewares/check')

router.get('/jd', check.checkuser,chart.getchart)
router.get('/jdCalculation', check.checkuser, chart.getCalculation)

module.exports = router