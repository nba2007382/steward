'use strict';
const userModel = require('../models/user/user')
const { verifyToken } = require('../token/token')
const dayjs = require('dayjs')
const { STATUS_CODES,  sendResponse } = require('../utils/utils');
const secretKey = require('../config/tokenKey')

  // Define a class for the check service
  class Check { 
    async checkUser(req, res, next) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (token == "undefined") {
                sendResponse(res, STATUS_CODES.UNAUTHORIZED, {message: "您还没有登录"});
                return;
            } else {
                // 使用token对象的verifyToken方法
                verifyToken(token, secretKey.login, function callback(err, payload) {
                    if (err) {
                        sendResponse(res, STATUS_CODES.UNAUTHORIZED, {message: "token无效"});
                        return;
                    }
                    const { exp, userEmail, userName } = payload;
                    console.log(payload);
                    console.log(dayjs(exp).format("YYYY-MM-DD HH:mm:ss"));
                    if (dayjs().isAfter(exp)) {
                        sendResponse(res, STATUS_CODES.UNAUTHORIZED, {message: "token过期"}); // 过期，401提示客户端刷新token
                        return;
                    } else {
                        // 否则通过验证
                        req.body.userInfo = { userEmail, userName };
                        next();
                    }
                });
            }
        } catch (error) {
            // 使用模板字符串来拼接字符串
            sendResponse(res, STATUS_CODES.UNAUTHORIZED, {message: `重新登陆${error}`});
        }
    }
    
    async checkRegister(req, res, next) {
        const { code, account } = req.params;
        if (!code) {
            sendResponse(res, STATUS_CODES.NOT_FOUND, {message: "您还没有注册或修改了激活链接"});
            return;
        } else {
            // 使用token对象的verifyToken方法
            verifyToken(code, secretKey.register, async function callback(err, payload) {
                if (err) {
                    res.render('active', { message: "您的链接有问题" });
                }
                const { exp, email } = payload;
                // refreshToken过期，重新登录
                if (dayjs().isAfter(exp)) {
                    res.render('active', { message: "您的链接失效" });
                } else if (email !== account) {
                    res.render('active', { message: "您激活的账号有问题" });
                }
                const data = await userModel.find({ email });
                if (data.status ==1) {
                    res.render('active', { message: '您的账号已经激活过' });
                }
                await userModel.updateMany({ email }, { $set: { status:1 } });
                res.render('active', { message:'成功' });
            });
        }
        next();
    }
}

module.exports = new Check()