const monito_JD = require('../../models/monito/JD');
const {queryApi} = require('../../influxDb/db')
class table {
    async geCalculationtTable(req, res, next) {
        const { userEmail, userName } = req.body.userInfo;
        const data = await queryAll(userEmail);
        res.json({
            status: '200',
            data
        });
    }

}

async function queryAll(userEmail) {
  const pipeline = [
      // 按照名称分组，并将价格和时间放入数组中
      { $match: { from: userEmail } },
      { $group: { _id: "$id" } },
      // 将_id字段重命名为name字段，并保留data和time字段
      { $project: {_id: "$_id" } }
    ];
  // 使用聚合管道查询集合，并返回结果数组
  const result = await monito_JD.aggregate(pipeline);
  const ids = result.map(el => el._id.toString());
  const obj = {};
  const condition = ids.reduce((acc, cur, i) => {
      if (i == 0) {
        return `r.id == "${cur}"`;
      } else {
        return acc + ` or r.id == "${cur}"`;
      }
    }, "");
    if (!condition) return obj;
    const fluxQuery = `from (bucket: "Steward")
        |> range (start: -1w)
        |> pivot (rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> filter(fn: (r) => ${condition})
        |> sort(columns: ["_time"], desc: true) |> limit(n: 1)`
        ;
  // 使用client.getQueryApi ()函数，根据组织ID创建一个查询API对象
  // 使用queryApi.queryRows ()函数，执行Flux查询，并传入一个回调对象，用于处理每一行数据、错误和完成事件
  return await new Promise((resolve, reject) => {
      queryApi.queryRows (fluxQuery, {
          next(row, tableMeta) {
            // 将行数据转换为对象
            const o = tableMeta.toObject(row);
            // 输出对象中的字段和值
            if (!obj[o.id]) {
                obj[o.id] = {};
            };
            obj[o.id][o._measurement] = o.value;
            obj[o.id]['price'] = o.price;
            obj[o.id]['name'] = o.name;
            obj[o.id]['id'] = o.id;
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

module.exports = new table()