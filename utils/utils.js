const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418, // This is a joke code
};

const MESSAGES = {
  ADD_SUCCESS: "添加成功",
  ADD_FAIL: "添加失败",
  DEL_SUCCESS: "删除成功",
  DEL_FAIL: "删除失败",
  UPDATE_SUCCESS: "更新成功",
  UPDATE_FAIL: "更新失败",
  SEARCH_SUCCESS: "搜索成功",
  SEARCH_FAIL: "搜索失败",
  LOGIN_SUCCESS: "登录成功",
  LOGIN_FAIL: "登录失败",
  LOGOUT_SUCCESS: "登出成功",
  LOGOUT_FAIL: "登出失败",
  REGISTER_SUCCESS: "注册成功",
  REGISTER_FAIL: "注册失败",
  VERIFY_SUCCESS: "验证成功",
  VERIFY_FAIL: "验证失败",
  RESET_SUCCESS: "重置成功",
  RESET_FAIL: "重置失败",
  SEND_SUCCESS: "发送成功",
  SEND_FAIL: "发送失败",
  RECEIVE_SUCCESS: "接收成功",
  RECEIVE_FAIL: "接收失败",
  UPLOAD_SUCCESS: "上传成功",
  UPLOAD_FAIL: "上传失败",
  DOWNLOAD_SUCCESS: "下载成功",
  DOWNLOAD_FAIL: "下载失败",
  COPY_SUCCESS: "复制成功",
  COPY_FAIL: "复制失败",
  PASTE_SUCCESS: "粘贴成功",
  PASTE_FAIL: "粘贴失败"
};

// Define a helper function to send a response with a status code and a message
function sendResponse(res, status, data) {
  res.status(status).send({
    status,
    data,
  });
}

// Helper method to handle database errors
function handleDBError(res, error) {
  // Use the STATUS_CODES object to get the status code and message
  sendResponse(res, STATUS_CODES.INTERNAL_ERROR, { message: "数据库出错" + error });
}

module.exports = { STATUS_CODES, MESSAGES, sendResponse, handleDBError };