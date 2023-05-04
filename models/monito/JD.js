const mongoose = require("mongoose")
const Schema = mongoose.Schema
const cheerio = require('cheerio');
const getBrowserInstance = require('../../puppeteer/index')
const {storeStats} = require('../../influxDb/db')
const TackManager = require('../../config/task');

const monitoJdSchema = new Schema({
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
// 定义一个异步函数，用于添加商品
monitoJdSchema.statics.addgoods = async function (url, id, email) {
  // 声明变量，使用const或let
  let page;
  try {
    // 获取浏览器实例
    const Browser = await getBrowserInstance();
    // 创建一个新的页面
    page = await Browser.newPage();
    // 打开指定的url
    await page.goto(url);
    // 等待页面加载完成，直到找到价格元素
    await page.waitForFunction(
      'document.querySelector(".summary-price .price").textContent != ""'
    );
    // 获取页面的html内容
    const html = await page.content();
    // 关闭页面
    page?.close?.();
    page = null;
    // 使用cheerio模块，解析html内容
    const $ = cheerio.load(html);
    // 调用一个单独的函数，获取商品信息
    const goodsInfo = getGoodsInfo($);
    // 设置开始时间
    const startTime = Date.now();
    // 设置发送者邮箱
    const from = email;
    // 设置商品链接
    const href = url;
    // 设置时间数组
    const time = [];
    // 创建一个数据对象，包含商品信息和其他属性
    const data = { ...goodsInfo, href, startTime, time, from, id };
    // 插入数据到数据库中
    await monito_JD.insertMany([data]);
    // 调用setInfluxDb函数，设置数据库参数
    setInfluxDb(id);
  } catch (err) {
    console.log("添加失败", err);
    throw err;
  } finally {
    page?.close?.();
  }
};

// 定义一个异步函数，用于更新商品
monitoJdSchema.statics.updategoods = async function () {
  let page;
  try {
    // 获取数据库中的数据
    const data = await monito_JD.find({});
    const time = Date.now();
    // 获取浏览器实例
    const Browser = await getBrowserInstance();
    // 创建一个新的页面
    page = await Browser.newPage();
    const stopTask = TackManager.getJdStopTask();
    // 使用for循环和await来处理异步函数
    for (const el of data) {
      try {
        if (stopTask[el.id] === true) continue;
        // 获取元素中的链接地址
        const url = el.href;
        // 打开指定的url
        await page.goto(url);
        // 等待页面加载完成，直到找到价格元素
        await page.waitForFunction(
          'document.querySelector(".summary-price .price").textContent != ""'
        );
        // 获取页面的html内容
        const html = await page.content();
        // 调用更新信息的函数
        await updataInfo(html, el, time);
        // 关闭页面
        console.log("JD更新成功");
        // 等待10秒，准备下一次循环
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } catch (err) {
        console.log("更新失败" + el.id);
      }
    }
    // 关闭页面
    page?.close?.();
  } catch (err) {
    console.log("商品更新失败", err);
  } finally {
    page?.close?.();
  }
};

// 定义一个异步函数，用来更新信息
async function updataInfo(html, el, time) {
  // 使用cheerio模块，解析html内容
  const $ = await cheerio.load(html);
  // 调用一个单独的函数，获取商品信息
  const goodsInfo = getGoodsInfo($);
  // 更新数据库中的数据，插入价格和时间，修改标签
  await monito_JD.updateMany(
    { id: el.id },
    { $push: { price: goodsInfo.price, time }, $set: { label: goodsInfo.label } }
  );
  // 调用setInfluxDb函数，设置数据库参数
  setInfluxDb(el.id);
}

// 定义一个函数，用于获取商品信息
function getGoodsInfo($) {
  // 获取第一个匹配的价格元素，并使用text()方法获取其内容
  const price = $(".itemInfo-wrap .summary-price-wrap .summary-price.J-summary-price .dd .p-price .price")
    .first()
    .text();
  // 获取第一个匹配的标签元素，并使用text()方法获取其内容
  const label = $(".summary-price.J-summary-price .dt").first().text();
  // 获取第一个匹配的图片元素，并使用attr()方法获取其src属性
  const img = $(".product-intro .preview-wrap #preview #spec-n1 #spec-img")
    .first()
    .attr("src");
  // 获取第一个匹配的标题元素，并使用text()方法获取其内容，并去除空格
  const title = $(".product-intro.clearfix .itemInfo-wrap .sku-name")
    .first()
    .text()
    .trim();
  // 返回一个对象，包含价格，标签，图片和标题属性
  return { price, label, img, title };
}

function setInfluxDb(id) {
    monito_JD.findOne({ id }).exec(function (err, doc) {
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


const monito_JD = mongoose.model('monito_JD', monitoJdSchema)


module.exports = monito_JD