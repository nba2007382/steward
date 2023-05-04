const express = require('express')
const admin = require('../controller/admin/admin')
const router = express.Router()

router.post('/login', admin.login)


module.exports = router