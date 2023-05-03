const monito_TM = require('../../models/monito/TM');
const { STATUS_CODES, MESSAGES, sendResponse } = require('../../utils/utils');
// Define a constant for the degrade parameter
const DEGRADE_PARAM = "&degrade_pc=true";

// Define a constant for the id regex
const ID_REGEX = /id=([^&]*)/;

// Define a helper function to get the id from a URL
function getIdFromUrl(url) {
  return url.match(ID_REGEX)[1];
}

// Define a helper function to append the degrade parameter to a URL if needed
function appendDegradeParam(url) {
  return url.includes(DEGRADE_PARAM) ? url : url + DEGRADE_PARAM;
}

class monito {
    // Define a method to get goods by user email
  async getGoods(req, res, next) {
    try {
      const { userEmail } = req.body.userInfo;
      const list = await monito_TM.find({ from: userEmail });
      res.send({
        status: STATUS_CODES.OK,
        data: list,
      });
    } catch (error) {
      // Handle any errors
      console.error(error);
      sendResponse(res, STATUS_CODES.INTERNAL_ERROR, {message: error.message});
    }
  }

  // Define a method to add goods by URL and user email
  async addGoods(req, res, next) {
    try {
      let params = req.query;
      let url = params.url;
      // Append the degrade parameter if needed
      url = appendDegradeParam(url);
      const { userEmail } = req.body.userInfo;
      // Get the id from the URL
      const id = getIdFromUrl(url);
      const data = await monito_TM.find({ id });
      console.log(url);
      if (data.length == 0) {
        // Add new goods if not found
        await monito_TM.addGoods(url, id, userEmail);
        sendResponse(res, STATUS_CODES.CREATED,{ message:MESSAGES.ADD_SUCCESS});
        return;
      }
      const index = await monito_TM.find({ id, from: userEmail });
      if (index.length !== 0) {
        // Throw an error if goods already added by user
        throw new Error("已添加过该商品");
      } else {
        // Update existing goods with user email
        await monito_TM.updateMany({ id }, { $addToSet: { from: userEmail } });
        sendResponse(res, STATUS_CODES.CREATED, { message:MESSAGES.ADD_SUCCESS});
        return;
      }
    } catch (error) {
      // Handle any errors
      console.error(error);
      sendResponse(res, STATUS_CODES.CONFLICT, {message:MESSAGES.ADD_FAIL});
    }
  }

  // Define a method to delete goods by id and user email
  async delGoods(req, res, next) {
    try {
      const { id } = req.body;
      const { userEmail } = req.body.userInfo;
      const data = await monito_TM.find({ id: id, from: userEmail });
      console.log(data[0]);
      console.log(data[0].from);
      if (data[0].from.length == 1) {
        // Delete goods if only one user added it
        await monito_TM.deleteMany({ id: id, from: userEmail });
        sendResponse(res, STATUS_CODES.OK, {message:MESSAGES.DEL_SUCCESS});
        return;
      } else {
        // Remove user email from existing goods
        await monito_TM.updateOne(
          { id },
          { $pull: { from: { $in: [userEmail] } } }
        );
        sendResponse(res, STATUS_CODES.OK, {message:MESSAGES.DEL_SUCCESS});
        return;
      }
    } catch (error) {
      // Handle any errors
      console.error(error);
      sendResponse(res, STATUS_CODES.NOT_FOUND, {message:MESSAGES.DEL_FAIL}
        );
    }
  }
}

module.exports = new monito()