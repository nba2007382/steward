const express = require('express')
const monito_JD = require('../controller/monito/monito_JD')
const check = require('../middlewares/check')
const router = express.Router()
router.get('/jd/addgoods', check.checkuser, monito_JD.addgoods)
router.delete('/jd/delgoods', check.checkuser, monito_JD.delgoods)
router.get('/jd/getgoods', check.checkuser, monito_JD.getgoods)
module.exports = router