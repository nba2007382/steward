const express = require('express')
const jdTable = require('../controller/table/jd')
const tmTable = require('../controller/table/tm')
const check = require('../middlewares/check')
const router = express.Router()

router.post('/jd', check.checkuser, jdTable.geCalculationtTable)
router.post('/tm', check.checkuser, tmTable.geCalculationtTable)



module.exports = router