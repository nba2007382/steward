const { addAdminLoginToken, addRefreshLoginToken } = require('../../token/token')
const { STATUS_CODES,  sendResponse, handleDBError } = require('../../utils/utils');
const adminData = require('../../config/admin');

class admin {
    // Method to login existing user
    async login(req, res, next) {
        try {
            const { user_email, user_password, user_remember } = req.body;
            if (!adminData) {
                sendResponse(res, STATUS_CODES.NOT_FOUND, {message: '没有配置管理员'});
                return;
            } else {
                let match = adminData.email ===  user_email && adminData.password ===  user_password ? true: false;
                if (!match) {
                    sendResponse(res, STATUS_CODES.UNAUTHORIZED, {message: '密码错误'});
                    return;
                }
            }
            // 使用token对象的addLoginToken方法
            const token = addAdminLoginToken({ name: adminData.name, email: adminData.email });
            // Create a return object with only the necessary fields
            const returnObject = {
                status: STATUS_CODES.OK,
                data: {
                    message: '登入成功',
                    access_token: token,
                    userInfo: { name: adminData.name, email: adminData.email, role: 1 },
                },
            };
            if (user_remember) {
                res.cookie('access_token', token);
                res.cookie('userInfo', { name: adminData.name, email: adminData.email });
                const refreshToken = addRefreshLoginToken({ name: adminData.name, email: adminData.email });
                returnObject.data['refresh_token'] = refreshToken;
            };
            // 使用res.json方法来发送json格式的响应
            res.json(returnObject);
        } catch (error) {
            //错误处理
            sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: error + ''});
        }
    }
}

module.exports = new admin()