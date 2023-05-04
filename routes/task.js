const express = require('express')
const task = require('../controller/task/task');
const router = express.Router()
router.post('/stop/jd', task.stopJdTask)
router.post('/stop/tm', task.stopTmallTask)
router.get('/jd', task.getJdStopTask)
router.get('/tm', task.getTmallStopTask)

module.exports = router