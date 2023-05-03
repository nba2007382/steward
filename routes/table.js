const express = require('express')
const jdTable = require('../controller/table/jd')
const tmTable = require('../controller/table/tm')
const check = require('../middlewares/check')
const router = express.Router()

router.post('/jd', check.checkUser, jdTable.getTable)
router.post('/tm', check.checkUser, tmTable.getTable)



module.exports = router