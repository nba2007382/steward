const schedule = require('node-schedule');
const monito_JD = require('../models/monito/JD')
const controlEmail = require('./email')
    // 生成新的定时任务
let interval = async(options) => {
        return new Promise((resolve, reject) => {
            // 终止之前的定时任务
            try {
            editMaintainTime(options)
                // 按照固定格式，设定定时任务，这里使用每条数据的唯一字段+定时任务时间，作为任务名称
                // 任务名称就是'名字_2020-6-22'
                // 任务时间就是'1-2 1 1 22 6 *' ，意思是每年的6月22日的1点1分的1秒~10秒触发，触发10次
            schedule.scheduleJob(`${options.unit_name}`, `${options.maintain_time}`, async() => {
                console.log('任务进行中')
                    // 写入你自己想在定时任务触发的时候，想要执行的函数
                monito_JD.updatagoods().then(async(res) => {
                    const JD = await monito_JD.find({})
                    talkJD(JD)
                    console.log('jd邮箱发送完成');
                })
                resolve(1)

                function talkJD(JD) {
                    try {
                        console.log('talkJD开始');
                        for (let i = 0; i < JD.length; i++) {
                            const el = JD[i];
                            if (el.price[el.price.length - 2] !== el.price[el.price.length - 1]) {
                                const difference = el.price[el.price.length - 1] - el.price[el.price.length - 2];
                                if (Number.isNaN(difference)) return;
                                const subject = '您添加的京东商品价格有变动'
                                const content = difference < 0 ? "<div>商品：" + el.title + " 今天已经降价" + Math.abs(difference) + "元<a>" + el.href + "<a/><div/>" :
                                    "<div>商品：" + el.title + " 今天已经涨价" + Math.abs(difference) + "元<a>" + el.href + "<a/><div/>"
                                controlEmail.sendEmail({ to: el.from, content, subject })
                            }
                        }
                        console.log('talkJD完毕');
                        return
                    } catch (error) {
                        console.log('talkJD识别' + error);
                    }

                }

            })
            } catch (error) {
                console.log(error);
            }
        })
    }
    // 删除定时任务
const editMaintainTime = async(options) => {
    console.log('options', options)

    // 查看所有的定时任务
    for (let i in schedule.scheduledJobs) {
        console.error("任务删除前：" + i);
    }
    // 终止之前的定时任务
    console.log('终止的任务', `${options.alarm14}`)
    if (schedule.scheduledJobs[`${options.alarm14}`]) {
        schedule.scheduledJobs[`${options.alarm14}`].cancel();
    }

    // 查看剩下的定时任务
    for (let i in schedule.scheduledJobs) {
        console.error("任务删除后：" + i);
    }
    // time.cancel()

    console.log('删除成功')
}


// 时间选择

const intervalControl = {
    interval: interval
}

module.exports = intervalControl