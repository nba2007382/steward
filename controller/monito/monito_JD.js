const monito_JD = require('../../models/monito/JD')
const { STATUS_CODES, MESSAGES, sendResponse, handleDBError } = require('../../utils/utils');

function getIdFromUrl(url) {
    let regex = /(\d+)\.html$/ //从url中筛选出— id               
    const id = url.match(regex)[1];
    console.log(id);
    return id;
}


class monito {

    async getGoods(req, res, next) {
        try {
          const { userEmail } = req.body.userInfo;
          const list = await monito_JD.find({ from: userEmail })
          res.send({
            status: STATUS_CODES.OK,
            data: list,
          });
        } catch (error) {
          // Handle any errors
          console.error(error);
          sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: error.message});
        }
      }
    

    // 定义一个异步方法，用于添加商品
    async addgoods(req, res, next) {
        try {
            let params = req.query;
            const url = params.url;
            const { userEmail } = req.body.userInfo
            const id = getIdFromUrl(url)
            const data = await monito_JD.find({ id })
            if (data.length == 0) {
                await monito_JD.addgoods(url, id, userEmail)
                // 使用sendResponse函数发送状态码201和成功信息
                sendResponse(res, STATUS_CODES.CREATED, { message: "Added successfully" });
                return
            }
            const index = await monito_JD.find({ id, from: userEmail })
            if (index.length !== 0) {
                throw new Error('已添加过该商品')
            } else {
                await monito_JD.updateMany({ id }, { $addToSet: { from: userEmail } })
                // 使用sendResponse函数发送状态码201和成功信息
                sendResponse(res, STATUS_CODES.CREATED, { message: "Added successfully" });
                return
            }
        } catch (error) {
            // 使用sendResponse函数发送状态码409和失败信息
            sendResponse(res, STATUS_CODES.CONFLICT, { type: "add_goods_Failed", message: "---添加失败" });
            return
        }
    }

    // 定义一个异步方法，用于删除商品
    async delgoods(req, res, next) {
        try {
            const { id } = req.body
            const { userEmail } = req.body.userInfo
            const data = await monito_JD.find({ id: id, from: userEmail })
            console.log(data[0]);
            console.log(data[0].from);
            if (data[0].from.length == 1) {
                await monito_JD.deleteMany({ id: id, from: userEmail })
                // 使用sendResponse函数发送状态码200和成功信息
                sendResponse(res, STATUS_CODES.OK, { message: "Deleted successfully" });
                return
            } else {
                await monito_JD.updateOne({ id }, { $pull: { from: { $in: [userEmail] } } })
                // 使用sendResponse函数发送状态码200和成功信息
                sendResponse(res, STATUS_CODES.OK, { message: "Deleted successfully" });
                return
            }
        } catch (err) {
            // 使用sendResponse函数发送状态码404和失败信息
            sendResponse(res, STATUS_CODES.NOT_FOUND, { message: "Delete failed" });
            return
        }
    }
}

module.exports = new monito()