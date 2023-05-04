const express = require('express')
const user = require('../controller/user/user')
const router = express.Router()
router.post('/register', user.register)
router.delete('/del', user.del)
router.get('/register/active', user.activeEmail)
router.post('/login', user.login)
router.get('/', user.getUsers)

module.exports = router