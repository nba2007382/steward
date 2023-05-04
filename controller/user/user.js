const userModel = require('../../models/user/user')
const { addLoginToken, verifyToken, addActiveToken, addRefreshLoginToken } = require('../../token/token')
const controlEmail = require('../../schedule/email')
const { localhost } = require('../../config/lochalhost')
const { STATUS_CODES,  sendResponse, handleDBError } = require('../../utils/utils');
const secretKey = require('../../config/tokenKey')
const dayjs = require('dayjs')

async function sendActivationEmail(email, code) {
  const subject = "邮箱注册激活";
  const emailContent = `
  <div style="background-color: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #cccccc;">
      <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
        <h1 style="text-align: center; color: #333333;">欢迎加入我们！</h1>
        <p style="text-align: center;">你已经成功注册了我们的网站，只差一步就可以开始使用我们的服务了。</p>
        <p style="text-align: center;">请点击下面的链接，激活你的账号：</p>
        <div style="text-align: center;">
          <a target="_blank" style="display: block; padding: 10px 20px; background-color: #0099ff; color: white; text-decoration: none;">${localhost}/user/register/active?code=${code}&account=${email}</a>
        </div>
        <p style="text-align: center;">如果你没有注册过我们的网站，请忽略这封邮件。</p>
        <p style="text-align: center;">感谢你对我们的支持！</p>
      </div>
    </div>
  </div>
  `;
  controlEmail.sendEmail({ to: email, content: emailContent, subject });
}

class user {
    async activeEmail(req, res, next) {
      try {
        const { code, account } = req.query;
        if (!code || !account) {
          res.status(400).render("active", { message: "链接异常" });
          return;
        }
        // 使用token对象的verifyToken方法
        verifyToken(code, secretKey.register, async function (err, payload) {
          if (err) {
            res.render("active", { message: "您的链接有问题" });
          }
          const { exp, email } = payload;
          // refreshToken过期，重新登录
          if (dayjs().isAfter(exp)) {
            res.render("active", { message: "您的链接失效" });
          } else if (email !== account) {
            res.render("active", { message: "您激活的账号有问题" });
          }
          const data = await userModel.find({ email });
          if (data.status == 1) {
            res.render("active", { message: "您的账号已经激活过" });
          }
          await userModel.updateMany({ email }, { $set: { status: 1 } });
          res.render("active", { message: "成功" });
        });
        return;
      } catch (err) {
        // Use the sendResponse function to send the error message
        sendResponse(res, STATUS_CODES.INTERNAL_ERROR,{message: "激活出错" + err});
      }
    }

    async del(req, res, next) {
      try {
        const { email } = req.body;
        await userModel.deleteOne({ email });
        sendResponse(res, STATUS_CODES.OK, {message: '删除成功'});
      } catch (error) {
        sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: '删除失败'});
      }
    }

    async getUsers(req, res, next) {
      try {
        const data = await userModel.find({}).select('-password').exec();;
        sendResponse(res, STATUS_CODES.OK, { data });
      } catch (error) {
        sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: '获取失败'});
      }
    }

    async register(req, res, next) {
        try {
            const { user_email, user_name, user_password } = req.body;
            const user = await userModel.find({ email: user_email });
            console.log(user); //验证用户是否已注册
            if (user.length !==0) {
                if (user[0].status ==0) {
                    // 使用token对象的addActiveToken方法
                    const code = addActiveToken(user_email);
                    await sendActivationEmail(user_email, code);
                    sendResponse(res, STATUS_CODES.CONFLICT, {message: '邮箱已经注册但还未激活，已重新发送邮件到您的邮箱请前往邮箱激活'});
                    return;
                }
                if (user[0].status ==1) {
                    sendResponse(res, STATUS_CODES.CONFLICT, {message: '邮箱已经注册'});
                    return;
                }
            }
            //用户参数
            const userInfo = {
                email: user_email,
                name: user_name,
                password: user_password,
                status:0 ,
                create_time : Date.now('YYYY-MM-DD')
            };
            //新建用户
            console.log("newGuess.save userInfo-->" + JSON.stringify(userInfo));
            try {
                await userModel.insertMany(userInfo);
                // 使用token对象的addActiveToken方法
                const code = addActiveToken(user_email);
                await sendActivationEmail(user_email, code);
                sendResponse(res, STATUS_CODES.CREATED, {message: "新用户注册成功 and 激活邮箱发送成功"});
            } catch (error) {
                handleDBError(res, error);
            }
        } catch (error) {
            sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: error + ''});
        }
    }

    // Method to login existing user
    async login(req, res, next) {
        try {
            const { user_email, user_password, user_remember } = req.body;
            // 使用findOne方法代替find方法
            const user = await userModel.findOne({ email: user_email });
            if (!user) {
                sendResponse(res, STATUS_CODES.NOT_FOUND, {message: '没有找到邮箱，邮箱可能还没注册'});
                return;
            } else {
                // 使用bcrypt模块来比较密码
                const match = user_password === user.password;
                if (!match) {
                    sendResponse(res, STATUS_CODES.UNAUTHORIZED, {message: '密码错误'});
                    return;
                }
            }
            // 使用token对象的addLoginToken方法
            const token = addLoginToken({ name: user.name, email: user.email });
            // Create a return object with only the necessary fields
            const returnObject = {
                status: STATUS_CODES.OK,
                data: {
                    message: '登入成功',
                    access_token: token,
                    userInfo: { name: user.name, email: user.email, role: 0 },
                },
            };
            if (user_remember) {
                res.cookie('access_token', token);
                res.cookie('userInfo', { name: user.name, email: user.email });
                const refreshToken = addRefreshLoginToken({ name: user.name, email: user.email });
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

module.exports = new user()