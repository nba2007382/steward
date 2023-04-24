const monito_JD = require('../../models/monito/JD');
const {queryApi} = require('../../influxDb/db')
class chart {
    async getchart(req, res, next) {
        const { userEmail, userName } = req.body.userInfo;
        const data = await generateArray(userEmail);
        res.json({
            status: '200',
            data
        });
    }

    async getCalculation(req, res, next) {
        const { id } = req.body
        const data = await queryAll();
        res.json({
            status: '200',
            data
        });
    }

}


async function queryAll() {
    // 定义一个Flux查询语句，查询所有产品的最大值和平均值
    const obj = {};
    const fluxQuery = 'from (bucket: "Steward") |> range (start: -1w) |> pivot (rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value") |> filter(fn: (r) => r.name != "") |> group (columns: ["name"]) |> yield ()';
    // 使用client.getQueryApi ()函数，根据组织ID创建一个查询API对象
    // 使用queryApi.queryRows ()函数，执行Flux查询，并传入一个回调对象，用于处理每一行数据、错误和完成事件
    return await new Promise((resolve, reject) => {
        queryApi.queryRows (fluxQuery, {
            next(row, tableMeta) {
              // 将行数据转换为对象
              const o = tableMeta.toObject(row);
              // 输出对象中的字段和值
              if (!obj[o.name]) {
                  obj[o.name] = {};
              };
              if (!obj[o.name][o._measurement]) {
                  obj[o.name][o._measurement] = {
                      data: [],
                      time: [],
                  }
              };
              obj[o.name][o._measurement].data.push(o.value);
              obj[o.name][o._measurement].time.push(o._time);
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

const generateArray = async (userEmail) => {
    const pipeline = [
        // 按照名称分组，并将价格和时间放入数组中
        { $match: { from: userEmail } },
        { $group: { _id: "$id",  name: { $first: "$title" }, data: { $push: "$price" }, time: { $push: "$time" } } },
        // 将_id字段重命名为name字段，并保留data和time字段
        { $project: {id: "$_id", _id:0, name: 1, data: 1, time: 1 } }
      ];
    // 使用聚合管道查询集合，并返回结果数组
    const result = await monito_JD.aggregate(pipeline);
    return result;
};
module.exports = new chart()