const monito_JD = require('../../models/monito/JD')
const {queryApi} = require('../../influxDb/db')
const { STATUS_CODES, MESSAGES, sendResponse } = require('../../utils/utils');

// Define a class for the pages_JD service
class JD {

  // Define a method to get goods info by id
  async getGoodsInfo(req, res, next) {
    try {
      const { id } = req.query;
      const goodsInfo = await monito_JD.find({ id });
      if (goodsInfo) {
        sendResponse(res, STATUS_CODES.OK, { goodsInfo: goodsInfo[0] });
        return;
      }
      sendResponse(res, STATUS_CODES.NOT_FOUND, { message: "失败" });
    } catch (error) {
      // Handle any errors
      console.error(error);
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: error.message});
    }
  }

  // Define a method to get calculation data by id
  async getCalculation(req, res, next) {
    try {
      const { id } = req.query;
      const data = await getCalculationData(id);
      sendResponse(res, STATUS_CODES.OK, {data});
    } catch (error) {
      // Handle any errors
      console.error(error);
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: error.message});
    }
  }
}

async function getCalculationData(id) {
  const fluxQuery = `from (bucket: "Steward")
        |> range (start: -1w)
        |> pivot (rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> filter(fn: (r) => r.id == string(v: ${id}))`;
  let obj = {};
  return await new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        // 将行数据转换为对象
        const o = tableMeta.toObject(row);
        // 输出对象中的字段和值
        if (!obj[o._measurement]) {
          obj[o._measurement] = {
            data: [],
            time: [],
          };
        }
        obj[o._measurement].data.push(o.value);
        obj[o._measurement].time.push(o._time);
      },
      error(error) {
        // 输出错误信息
        console.error(error);
        reject(error);
        console.log("Finished ERROR");
      },
      complete() {
        // 输出完成信息
        resolve(obj);
        console.log("Finished SUCCESS");
      },
    });
  });
}

module.exports = new JD();