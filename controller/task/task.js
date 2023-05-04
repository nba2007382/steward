const TackManager = require('../../config/task');
const { STATUS_CODES, MESSAGES, sendResponse } = require('../../utils/utils');

class Task {
  stopJdTask(req, res, next) {
    try {
      const { id, status } = req.body.data;
      TackManager.stopJdTask(id, status);
      sendResponse(res, STATUS_CODES.OK, { message: '成功' })
    } catch (error) {
      console.log(error);
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: '失败' })
    }
  }

  stopTmallTask(req, res, next) {
    try {
      const { id, status } = req.body.data;
      TackManager.stopTmallTask(id, status);
      sendResponse(res, STATUS_CODES.OK, { message: '暂停成功' })
    } catch (error) {
      console.log(error);
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: '暂停失败' })
    }
  }

  getTmallStopTask(req, res, next) {
    try {
      const data = TackManager.getTmallStopTask();
      sendResponse(res, STATUS_CODES.OK, { data })
    } catch (error) {
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: error })
    }
  }

  getJdStopTask(req, res, next) {
    try {
      const data = TackManager.getJdStopTask();
      sendResponse(res, STATUS_CODES.OK, { data })
    } catch (error) {
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: error })
    }
  }
}

module.exports = new Task()