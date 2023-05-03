const mongoose = require("mongoose")
const Schema = mongoose.Schema
const cheerio = require('cheerio');
const getBrowserInstance = require('../../puppeteer/index')
const {storeStats} = require('../../influxDb/db')

const monitoTmSchema = new Schema({
    id: Number,
    title: String,
    href: String,
    img: String,
    price: Array,
    label: String,
    startTime: Date,
    time: Array,
    from: Array
})
monitoTmSchema.statics.addgoods = async function(url, id, email) {
    // declare variables with const or let
    let page;
    try {
      const Browser = await getBrowserInstance();
      page = await Browser.newPage();
      await page.goto(url);
      await page.waitForSelector("#detail .tm-price-panel.tm-price-cur .tm-price");
      await page.waitForFunction('document.querySelector("#detail .tm-price-panel.tm-price-cur .tm-price").textContent != ""');
      const html = await page.content();
      page?.close?.();
      page = null;
      const $ = cheerio.load(html);
      // 获取第一个匹配的价格元素，并使用text()方法获取其内容
      const price = $('#detail .tm-price-panel.tm-price-cur .tm-price').first().text();
      // 获取第一个匹配的标签元素，并使用text()方法获取其内容
      const label = $('#detail .tm-fcs-panel .tm-price-panel dt.tb-metatit').first().text();
      // 获取第一个匹配的图片元素，并使用attr()方法获取其src属性
      const img = $('.tb-gallery .tb-booth a img').first().attr('src');
      // 获取第一个匹配的标题元素，并使用text()方法获取其内容
      const title = $('.tb-detail-hd h1').first().text().trim();
      const startTime = Date.now();
      const from = email;
      const href = url;  
      const time = [];
      const data = { price, label, img, title, href, startTime, time, from, id };
      await monito_TM.insertMany([data]);
      setInfluxDb(id);
    } catch (err) {
      console.log('添加失败', err);
      throw(err);
    } finally  {
      page?.close?.();
    }
}
monitoTmSchema.statics.updategoods = async function() {
    let page;
    try {
        // 获取数据库中的数据
        const data = await monito_TM.find({});
        const time = Date.now();
        // 定义一个变量，用来存储当前的索引
        let i = 0;
        const Browser = await getBrowserInstance();
        page = await Browser.newPage();
        // 使用for循环和await来处理异步函数
        for (const el of data) {
            try {
                // 获取元素中的链接地址
                const url = el.href;
                // 启动一个无头浏览器
                
                await page.goto(url);
                await page.waitForSelector("#detail .tm-price-panel.tm-price-cur .tm-price");
                await page.waitForFunction('document.querySelector("#detail .tm-price-panel.tm-price-cur .tm-price").textContent != ""');
                const html = await page.content();
                // 调用更新信息的函数
                await updataInfo(html, el, time);
                // 关闭浏览
                console.log('TM更新成功');
                // 索引加一，准备下一次循环
                await new Promise(resolve => setTimeout(resolve, 10000));
            } catch (err) {
                console.log('更新失败'+el.id);
            }
        };
    } catch (err) {
        console.log('商品更新失败', err);
    } finally  {
      page?.close?.()
    }
}

// 定义一个异步函数，用来更新信息
async function updataInfo(html, el, time) {
  // 获取页面中的价格
  const $ = await cheerio.load(html);
  // 获取第一个匹配的价格元素，并使用text()方法获取其内容
  const price = $('#detail .tm-price-panel.tm-price-cur .tm-price').first().text();
  // 获取第一个匹配的标签元素，并使用text()方法获取其内容
  const label = $('#detail .tm-fcs-panel .tm-price-panel dt.tb-metatit').first().text();
  // 更新数据库中的数据，插入价格和时间，修改标签
  await monito_TM.updateMany(
  { id: el.id },
  { $push: { price, time }, $set: { label } });
  setInfluxDb(el.id);
};

function setInfluxDb(id) {
    monito_TM.findOne({ id }).exec(function (err, doc) {
    if (err) {
      // 处理错误
      console.log(err);
    } else {
      // doc是一个mongoose文档，包含price字段，它是一个数组
      // 获取price数组的长度，即价格信息的个数
      let count = doc.price.length;
      // 如果价格信息的个数大于0，才进行统计分析
      if (count > 0) {
        // 定义一些变量，用于存储统计结果
        let sum = 0; // 总额
        let max = 0; // 最大值
        let min = Infinity; // 最小值
        let mean = 0; // 平均值
        let variance = 0; // 方差
        let std = 0; // 标准差

        // 遍历price数组，对每个价格进行处理
        for (let i = 0; i < count; i ++) {
          // 获取当前价格，并转换为数字类型
          let price = Number (doc.price [i]);
          // 累加总额
          sum += price;
          // 更新最大值和最小值
          if (price > max) {
            max = price;
          }
          if (price < min) {
            min = price;
          }
        }

        // 计算平均值
        mean = sum / count;
        // 遍历price数组，计算方差
        for (let i = 0; i < count; i ++) {
          // 获取当前价格，并转换为数字类型
          let price = Number (doc.price [i]);
          // 累加平方差
          variance += Math.pow (price - mean, 2);
        }
        // 计算标准差
        std = Math.sqrt (variance / count);

        // 创建一个统计结果对象，包含各种分析指标和值的键值对
        let stats = {
          max: max,
          min: min,
          avg: mean,
          std: std
        };

        // 调用存储函数，将产品的_id和统计结果作为参数传入，并返回一个promise
        storeStats(id, stats,doc.price[doc.price.length - 1], doc.title)
          .then (() => {
            // 如果存储成功，输出提示信息
            console.log ('产品' + id + '的价格信息统计结果已存入influxdb。');
          })
          .catch ((err) => {
            // 如果存储失败，输出错误信息
            console.error ('存储失败：' + err.message);
          });
      } else {
        // 如果价格信息的个数等于0，输出提示信息
        console.log ('产品' + id + '没有价格信息。');
      }
    }
  });
}


const monito_TM = mongoose.model('monito_TM', monitoTmSchema)


module.exports = monito_TM;