
const fs = require('fs');

class Task {
  constructor() {
    fs.readFile('config/StopJdTask.json', 'utf8', (err, data) => { //异步地读取文件
      if (err) { //如果发生错误，打印错误信息
        this.JdTask = {};
        return;
      }
      this.JdTask = JSON.parse(data); //将文本转换为json对象
      console.log(this.JdTask); //在控制台打印对象
    });
    fs.readFile('config/StopTmallTask.json', 'utf8', (err, data) => { //异步地读取文件
      if (err) { //如果发生错误，打印错误信息
        this.TmallTask = {};
        return;
      }
      this.TmallTask = JSON.parse(data); //将文本转换为json对象
      console.log(this.TmallTask); //在控制台打印对象
    });
  }

  stopJdTask(id, status) {
    this.JdTask[id] = status === 1 ? true: false;
    console.log(id, status, this.JdTask);
    return fs.writeFile('config/StopJdTask.json', JSON.stringify(this.JdTask), (err) => {
      if (err) {
        return false
      } else {
        return true
      }
    });
  }

  stopTmallTask(id, status) {
    this.TmallTask[id] = status === 1 ? true: false;
    return fs.writeFile('config/StopTmallTask.json', JSON.stringify(this.TmallTask), (err) => {
      if (err) {
        return false
      } else {
        return true
      }
    });
  }

  getTmallStopTask() {
    console.log(this.TmallTask);
    return this.TmallTask;
  }

  getJdStopTask() {
    console.log(this.JdTask);
    return this.JdTask;
  }
}
module.exports = TackManager = new Task();