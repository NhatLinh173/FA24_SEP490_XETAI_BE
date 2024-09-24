const TeleSignSDK = require("telesignsdk");
require("dotenv").config();
const customerId = process.env.CUSTOMER_ID;
const apiKey = process.env.API_KEY;
const rest_endpoint = "https://rest-api.telesignsdk.com";
const timeout = 10000;

const client = new TeleSignSDK(customerId, apiKey, rest_endpoint, timeout);

const sendNotification = (phoneNumber, message) => {
  return new Promise((resolve, reject) => {
    client.sms.message(
      (error, responseBody) => {
        if (error) {
          reject(new Error(`Gửi thông báo SMS thất bại: ${error.message}`));
        } else {
          resolve(responseBody);
        }
      },
      phoneNumber,
      message,
      "ARN"
    );
  });
};

module.exports = sendNotification;
