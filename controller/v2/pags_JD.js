const monito_JD = require('../../models/monito/JD')
const getBrowserInstance = require('../../puppeteer/index')
const {queryApi} = require('../../influxDb/db')

class pages_JD {
    async getgoodsInfo(req, res, next) {
        const { id } = req.query
        const goodsInfo = await monito_JD.find({ id })
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
    async getPagination(req, res, next) {
        const { pageIndex, id } = req.query
        const evaluate = await getevaluate(id, pageIndex)
        if (evaluate) {
            res.send({
                evaluate: evaluate.comments
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
        res.send({data});
    }
}

async function getevaluate(id, pageIndex) {
    try {
        const brower = await getBrowserInstance();
        var page = await brower.newPage()
        await page.goto('https://club.jd.com/comment/productPageComments.action?callback=fetchJSON_comment98&productId=' + id + '&score=0&sortType=5&page=' + pageIndex + '&pageSize=10&isShadowSku=0&fold=1')
        const data = await page.$eval('body', el => el.innerHTML);
        if (!data) return;
        brower.close();
        const funcName = 'fetchJSON_comment98';
        // 使用字符串的indexOf方法，传入函数名和左括号，得到左括号的位置
        const leftIndex = data.indexOf(funcName + '(');
        // 使用字符串的lastIndexOf方法，传入右括号，得到右括号的位置
        const rightIndex = data.lastIndexOf(')');
        // 如果左右括号都存在，使用字符串的slice方法，传入左右括号的位置，截取括号内的内容
        console.log(data);
        const evaluate = JSON.parse(`${data.slice(leftIndex + funcName.length + 1, rightIndex)}`);
        return evaluate;
    } catch (error) {
        console.log(error);
    }
}

async function getCalculation(id) {
    // 定义一个Flux查询语句，查询所有产品的最大值和平均值
    const fluxQuery = `from(bucket: "Steward")
    |> range(start: -24h)
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> filter(fn: (r) => r.name == string(v: ${id}))
    |> group(columns: ["name", "_measurement"])
    |> last(column: "_time")
    |> group(columns: ["name"])
    |> yield()`;
    console.log(id)
    return await new Promise((resolve, reject) => {
        let arr = [];
        queryApi.queryRows (fluxQuery, {
            next(row, tableMeta) {
              // 将行数据转换为对象
              const o = tableMeta.toObject(row);
              arr.push(o);
              console.log(o);
            },
            error(error) {
              // 输出错误信息
              console.error(error);
              console.log('Finished ERROR');
            },
            complete() {
              // 输出完成信息
              console.log('Finished SUCCESS');
              resolve(arr)
            },
          });
    })
}

module.exports = new pages_JD()