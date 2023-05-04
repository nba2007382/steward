const monito_TM = require('../../models/monito/TM');
const {queryApi} = require('../../influxDb/db');
const { STATUS_CODES, MESSAGES, sendResponse } = require('../../utils/utils');


class chart {
  // 定义一个异步方法，用于获取图表数据
  async getChart(req, res, next) {
    try {
      // 从请求体中获取用户邮箱和用户名
      const { userEmail } = req.body.userInfo;
      // 调用一个单独的函数，生成一个数组，用于存储图表数据
      const data = await generateArray(userEmail);
        sendResponse(res, STATUS_CODES.OK, {data});
    } catch (error) {
      // 如果发生错误，使用sendResponse函数发送状态码500和错误信息
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: error.message });
    }
  }

  // 定义一个异步方法，用于获取计算结果
  async getCalculation(req, res, next) {
    try {
      // 从请求体中获取用户邮箱
      const { userEmail } = req.body.userInfo;
      // 调用一个单独的函数，查询所有的数据
      const data = await queryAll(userEmail);
      // 判断数据是否为空
      if (data.length > 0) {
        // 如果不为空，使用sendResponse函数发送状态码200和数据
        sendResponse(res, STATUS_CODES.OK, {data});
      } else {
        // 如果为空，使用sendResponse函数发送状态码404和错误信息
        sendResponse(res, STATUS_CODES.NOT_FOUND, { message: "No data found" });
      }
    } catch (error) {
      // 如果发生错误，使用sendResponse函数发送状态码500和错误信息
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: error.message });
    }
  }
}

// 定义一个异步函数，用于查询所有的数据
async function queryAll(userEmail) {
  // 定义一个聚合管道，用于按照id分组，并获取相关的属性
  const pipeline = [
    // 按照邮箱匹配数据
    { $match: { from: userEmail } },
    // 按照id分组，并获取第一个id值
    { $group: { _id: "$id" } },
    // 将_id字段重命名为id字段，并去除_id字段
    { $project: { _id: "$_id" } },
  ];
  // 使用聚合管道查询集合，并返回结果数组
  const result = await monito_TM.aggregate(pipeline);
  // 将结果数组中的每个元素的id属性转换为字符串，并存储在ids数组中
  const ids = result.map((el) => el._id.toString());
  console.log(ids);
  // 定义一个对象，用于存储查询结果
  const obj = {};
  // 定义一个条件字符串，用于拼接ids数组中的每个元素，形成一个Flux查询的条件表达式
  const condition = ids.reduce((acc, cur, i) => {
    if (i == 0) {
      return `r.id == "${cur}"`;
    } else {
      return acc + ` or r.id == "${cur}"`;
    }
  }, "");
  // 定义一个Flux查询字符串，用于从数据库中查询指定id的数据，并进行一些转换操作
  const fluxQuery = `from (bucket: "Steward")
          |> range (start: -1w)
          |> pivot (rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> filter(fn: (r) => ${condition})`;
  // 使用client.getQueryApi ()函数，根据组织ID创建一个查询API对象
  // 使用queryApi.queryRows ()函数，执行Flux查询，并传入一个回调对象，用于处理每一行数据、错误和完成事件
  return await new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        // 将行数据转换为对象
        const o = tableMeta.toObject(row);
        // 输出对象中的字段和值
        if (!obj[o.id]) {
          obj[o.id] = {};
        }
        if (!obj[o.id][o._measurement]) {
          obj[o.id][o._measurement] = {
            data: [],
            time: [],
          };
        }
        obj[o.id][o._measurement].data.push(o.value);
        obj[o.id][o._measurement].time.push(o._time);
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

// 定义一个异步函数，用于生成一个数组，用于存储图表数据
const generateArray = async (userEmail) => {
  // 定义一个聚合管道，用于按照id分组，并获取相关的属性
  const pipeline = [
    // 按照邮箱匹配数据
    { $match: { from: userEmail } },
    // 按照id分组，并获取第一个id值，名称，价格和时间
    {
      $group: {
        _id: "$id",
        name: { $first: "$title" },
        data: { $push: "$price" },
        time: { $push: "$time" },
      },
    },
    // 将_id字段重命名为id字段，并去除_id字段，保留name，data和time字段
    { $project: { id: "$_id", _id: 0, name: 1, data: 1, time: 1 } },
  ];
  // 使用聚合管道查询集合，并返回结果数组
  const result = await monito_TM.aggregate(pipeline);
  return result;
};

module.exports = new chart()