const jwt = require('jsonwebtoken')
const dayjs = require('dayjs')
const secretKey = require('../config/tokenKey')


const token = {
    addLoginToken({ name, email }) {

        return jwt.sign({
            userEmail: email,
            userName: name,
            exp: dayjs().add(30, 'm').valueOf()
        }, secretKey.login)
    },
    addActiveToken(email) {
        return jwt.sign({
            email,
            exp: dayjs().add(30, 'm').valueOf()
        }, secretKey.register)
    },
    addRefreshLoginToken({ name, email }) {
        return jwt.sign({
            userEmail: email,
            userName: name,
            exp: dayjs().add(8, 'h').valueOf()
        }, secretKey.login)
    },
    verifyLoginToken(token, callback) {
        jwt.verify(token, secretKey.login, callback)
    },
    verifyActiveToken(res, token, account, userModel) {
        jwt.verify(token, secretKey.register, async function(err, payload) {
            if (err) {
                res.render('active', { message: "您的链接有问题" })
            }
            const { exp, email } = payload
            // refreshToken过期，重新登录
            if (dayjs().isAfter(exp)) {
                res.render('active', { message: "您的链接失效" })
            } else if (email !== account) {
                res.render('active', { message: "您激活的账号有问题" })
            }
            const data = await userModel.find({ email })
            if (data.status == 1) {
                res.render('active', { message: '您的账号已经激活过' })
            }
            await userModel.updateMany({ email }, { $set: { status: 1 } })
            res.render('active', { message: '成功' })

        })
    },
    verifyRefreshLoginToken(token, callback) {
        jwt.verify(token, secretKey.login, callback)
    }
}

module.exports = token