const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI
const token = 'Jw6NxWOBQOblg2cwsIylYXmKpZZ5e3qdSWIK7NFeEEvJ8QyUAN5z6es6uPXvOZSF-jj9SLynjJMpw4kEwdVNBg=='
const org = 'admin'
const bucket = 'Steward'

const client = new InfluxDB({url: 'http://127.0.0.1:8086', token: token});
const {Point} = require ('@influxdata/influxdb-client');


// 定义一个函数，用来将分析结果转换为数据点的格式
function toPoint(result) {
  // 返回一个数据点对象，包含measurement、tags、fields、timestamp等字段
  return {
    measurement: result.measurement,
    tags: {
      name: result.name
    },
    fields: {
      value: result.value
    },
    timestamp: result.timestamp
  };
}
// 定义一个函数，用来将分析结果数组保存到数据库中
function saveResults(results) {
  // 使用数组的map方法，对每个分析结果调用toPoint函数，得到一个数据点数组
  const points = results.map(toPoint);
  // 使用InfluxDB对象的writePoints方法，传入数据点数组，将其保存到数据库中
  influx.writePoints(points)
    .then(() => {
      // 如果成功，打印保存成功的信息
      console.log('Data saved successfully.');
    })
    .catch((err) => {
      // 如果失败，打印错误信息
      console.error(err);
    });
}

// 定义一个存储函数，接受一个产品的_id和统计结果作为参数
function storeStats (productId, stats) {
  // 使用client.getWriteApi ()函数，根据组织ID和存储桶名称创建一个写入API对象
  let writeApi = client.getWriteApi (org, bucket);
  // 使用writeApi.useDefaultTags ()函数，设置默认的标签对象，包含产品的_id
  writeApi.useDefaultTags ({name: productId});
  // 遍历统计结果对象，对每个分析指标创建一个数据点
  for (let key in stats) {
    // 获取分析指标的值
    let value = stats [key];
    // 创建一个数据点对象，使用Point类的构造函数，并传入分析指标作为度量名称
    let point = new Point (key);
    // 使用point.floatField ()函数，设置字段对象，包含分析指标的值
    point.floatField ('value', value);
    // 使用writeApi.writePoint ()函数，将数据点对象添加到写入API对象中
    writeApi.writePoint (point);
  };
  // 使用writeApi.close ()函数，执行写入操作，并返回一个promise
  return writeApi.close().then((data) => {
    console.log(data);
    // queryAll()
  });
}

const queryApi = client.getQueryApi (org);
function queryAll() {
  // 定义一个Flux查询语句，查询所有产品的最大值和平均值
  const fluxQuery = `from(bucket: "Steward")
  |> range(start: -24h)
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> filter(fn: (r) => r.name != "")
  |> group(columns: ["name", "_measurement"])
  |> last(column: "_time")
  |> group(columns: ["name"])
  |> yield()`;
  // 使用client.getQueryApi ()函数，根据组织ID创建一个查询API对象
  // 使用queryApi.queryRows ()函数，执行Flux查询，并传入一个回调对象，用于处理每一行数据、错误和完成事件
  queryApi.queryRows (fluxQuery, {
    next(row, tableMeta) {
      // 将行数据转换为对象
      const o = tableMeta.toObject(row);
      // 输出对象中的字段和值
      console.log( o);
    },
    error(error) {
      // 输出错误信息
      console.error(error);
      console.log('Finished ERROR');
    },
    complete() {
      // 输出完成信息
      console.log('Finished SUCCESS');
    },
  });
}

module.exports = {InfluxDB: client, saveResults, storeStats, queryApi};