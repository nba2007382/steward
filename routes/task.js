const express = require('express')
const task = require('../controller/task/task');
const router = express.Router()
const check = require('../middlewares/check')
router.post('/stop/jd', check.checkAdmin, task.stopJdTask)
router.post('/stop/tm', check.checkAdmin, task.stopTmallTask)
router.get('/jd', task.getJdStopTask)
router.get('/tm', task.getTmallStopTask)

module.exports = router