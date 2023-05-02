const monito_TM = require('../../models/monito/TM')
const {queryApi} = require('../../influxDb/db')

class pages_TM {
    async getgoodsInfo(req, res, next) {
        const { id } = req.query
        const goodsInfo = await monito_TM.find({ id })
        if (goodsInfo) {
            res.send({
                status: '200',
                goodsInfo: goodsInfo[0],
            })
            return
        }
        res.send({
            msg: '失败'
        })

    }
    async getCalculation(req, res, next) {
        const { id } = req.query
        const data = await getCalculation(id);
        res.send({
            status: 200,
            data
        });
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

module.exports = new pages_TM()