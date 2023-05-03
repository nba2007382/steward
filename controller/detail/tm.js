const monito_TM = require('../../models/monito/TM')
const {queryApi} = require('../../influxDb/db')
const { STATUS_CODES, MESSAGES, sendResponse } = require('../../utils/utils');


class TM {
    // 定义一个异步方法，用于获取商品信息
    async getgoodsInfo(req, res, next) {
        // 从请求参数中获取id
        const { id } = req.query
        // 调用一个单独的函数，查询商品信息
        const goodsInfo = await monito_TM.find({ id })
        // 判断商品信息是否存在
        if (goodsInfo) {
            // 如果存在，使用sendResponse函数发送状态码200和商品信息
            sendResponse(res, STATUS_CODES.OK, { goodsInfo: goodsInfo[0] });
            return
        }
        // 如果不存在，使用sendResponse函数发送状态码404和错误信息
        sendResponse(res, STATUS_CODES.NOT_FOUND, { message: "Failed" });
    }
    // 定义一个异步方法，用于获取计算结果
    async getCalculation(req, res, next) {
        // 从请求参数中获取id
        const { id } = req.query
        // 调用一个单独的函数，获取计算结果
        const data = await getCalculation(id);
        if (data) {
             // 使用sendResponse函数发送状态码200和数据
            sendResponse(res, STATUS_CODES.OK, {data});
            return;
        }
        // 如果不存在，使用sendResponse函数发送状态码404和错误信息
        sendResponse(res, STATUS_CODES.NOT_FOUND, { message: "Failed" });
    }
}


async function getCalculation(id) {
    const fluxQuery = `from (bucket: "Steward")
          |> range (start: -1w)
          |> pivot (rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> filter(fn: (r) => r.id == string(v: ${id}))`
          ;
    let obj = {};
    return await new Promise((resolve, reject) => {
        queryApi.queryRows (fluxQuery, {
            next(row, tableMeta) {
              // 将行数据转换为对象
              const o = tableMeta.toObject(row);
              // 输出对象中的字段和值
              if (!obj[o._measurement]) {
                  obj[o._measurement] = {
                      data: [],
                      time: [],
                  }
              };
              obj[o._measurement].data.push(o.value);
              obj[o._measurement].time.push(o._time);
            },
            error(error) {
              // 输出错误信息
              console.error(error);
              reject(error)
              console.log('Finished ERROR');
            },
            complete() {
              // 输出完成信息
              resolve(obj);
              console.log('Finished SUCCESS');
            },
          });
    })
}

module.exports = new TM();