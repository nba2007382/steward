const schedule = require('node-schedule');
const monito_JD = require('../models/monito/JD')
const monito_TM = require('../models/monito/TM')
const { getChartImg } = require('../echarts/echarts');
const controlEmail = require('./email')
// 定义一个异步函数，用于创建定时任务
async function createScheduledJob(options) {
  // 使用schedule模块，根据options中的unit_name和maintain_time属性，创建一个定时任务
  // 定时任务的名称是unit_name，定时任务的时间是maintain_time
  // 定时任务的回调函数是一个异步函数，用于更新和发送商品信息
  schedule.scheduleJob(options.unit_name, options.maintain_time, async () => {
    console.log("任务进行中");
    // 调用两个异步函数，分别更新和发送京东和天猫的商品信息
    await updateAndSendGoodsInfo("京东", monito_JD);
    await updateAndSendGoodsInfo("天猫", monito_TM);
    // 返回1作为定时任务的结果
    return 1;
  });
}

// 定义一个异步函数，用于更新和发送商品信息
async function updateAndSendGoodsInfo(typeString, GoodsModel) {
  try {
    console.log(`开始更新和发送${typeString}商品信息`);
    // 调用updategoods方法，更新商品信息
    await GoodsModel.updategoods();
    // 调用find方法，获取商品信息数组
    const GoodsArr = await GoodsModel.find({});
    // 遍历商品信息数组，检查每个商品的价格是否有变动，如果有变动，就发送邮件通知
    for (const el of GoodsArr) {
      const lastPrice = el.price[el.price.length - 1];
      const prevPrice = el.price[el.price.length - 2];
      if (lastPrice !== prevPrice) {
        const difference = lastPrice - prevPrice;
        console.log(difference);
        if (Number.isNaN(difference)) continue;
        const img = `<img src=${getChartImg(el)}></img>`;
        // 调用一个单独的函数，用于发送邮件
        sendEmail(typeString, el, difference, img);
      }
    }
    console.log(`更新和发送${typeString}商品信息完毕`);
    return;
  } catch (error) {
    console.log(`更新和发送${typeString}商品信息出错` + error);
  }
}
  
// 定义一个函数，用于发送邮件
function sendEmail(typeString, el, difference, img) {
  const subject = `您添加的${typeString}商品价格有变动`;
  // 使用模板字符串，创建邮件内容
  const content = `${img}<div>商品：${el.title} 今天已经${
    difference < 0 ? "降价" : "涨价"
  }${Math.abs(difference)}元<a>${el.href}<a/><div/>`;
  controlEmail.sendEmail({ to: el.from, content, subject });
}

// 定义一个异步函数，用于删除定时任务
async function deleteScheduledJob(options) {
  console.log("options", options);

  // 查看所有的定时任务
  for (let i in schedule.scheduledJobs) {
    console.error("任务删除前：" + i);
  }
  // 终止之前的定时任务
  console.log("终止的任务", `${options.alarm14}`);
  if (schedule.scheduledJobs[`${options.alarm14}`]) {
    schedule.scheduledJobs[`${options.alarm14}`].cancel();
  }

  // 查看剩下的定时任务
  for (let i in schedule.scheduledJobs) {
    console.error("任务删除后：" + i);
  }
  // time.cancel()

  console.log("删除成功");
}

// 定义一个异步函数，用于修改定时任务
async function editScheduledJob(options) {
  // 先删除原来的定时任务
  await deleteScheduledJob(options);
  // 再创建新的定时任务
  await createScheduledJob(options);
}

// 时间选择

const intervalControl = {
    interval: editScheduledJob
}

module.exports = intervalControl