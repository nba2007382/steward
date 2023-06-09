const express = require('express')
const router = express.Router()
const authorization = require('../middlewares/authorizations')

router.put('/refresh', authorization.refreshToken)
module.exports = router