const jwt = require('jsonwebtoken')
const dayjs = require('dayjs')
const secretKey = require('../config/tokenKey')


// 定义一个token对象，包含四个方法
const token = {
    // 生成登录token，包含用户名，邮箱和过期时间
    addLoginToken({ name, email }) {
        const payload = {
            userEmail: email,
            userName: name,
            exp: dayjs().add(24, 'h').valueOf()
        }
        return jwt.sign(payload, secretKey.login)
    },
    // 生成激活token，包含邮箱和过期时间
    addActiveToken(email) {
        const payload = {
            email,
            exp: dayjs().add(30, 'm').valueOf()
        }
        return jwt.sign(payload, secretKey.register)
    },
    // 生成刷新登录token，包含用户名，邮箱和过期时间
    addRefreshLoginToken({ name, email }) {
        const payload = {
            userEmail: email,
            userName: name,
            exp: dayjs().add(120, 'h').valueOf()
        }
        return jwt.sign(payload, secretKey.login)
    },
    // 验证token是否有效，使用回调函数处理结果
    verifyToken(token, secretKey, callback) {
        jwt.verify(token, secretKey, callback)
    }
}

module.exports = token