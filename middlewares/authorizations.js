const { verifyToken, addLoginToken } = require('../token/token')
const dayjs = require('dayjs')
const { STATUS_CODES,  sendResponse } = require('../utils/utils');
const secretKey = require('../config/tokenKey')
  // Define a class for the authorization service
  class Authorization {
    async refreshToken(req, res, next) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            console.log(token);
            // 使用token对象的verifyToken方法
            verifyToken(token, secretKey.login, function callback(err, payload) {
                if (err) {
                    sendResponse(res, STATUS_CODES.FORBIDDEN, {message: "您的refreshToken验证错误"});
                    return;
                }
                const { userEmail, userName, exp } = payload;
                console.log(payload);
                console.log(dayjs(exp).format("YYYY-MM-DD HH:mm:ss"));
                if (dayjs().isAfter(exp)) {
                    sendResponse(res, STATUS_CODES.FORBIDDEN, {message: "您的登入过时，请重新登入"});
                    return;
                }
                console.log(userEmail);
                console.log(userName);
                sendResponse(res, STATUS_CODES.OK
                ,{
                    access_token: addLoginToken({ name: userName, email: userEmail }),
                    refresh_token: token,
                    message:"刷新成功",
                });
                return;
            });
        } catch (error) {
            // 使用模板字符串来拼接字符串
            sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: `刷新失败${error}`});
        }
    }
  }
module.exports = new Authorization()