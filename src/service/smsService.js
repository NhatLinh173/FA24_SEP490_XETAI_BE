require("dotenv").config();
const Nexmo = require("nexmo");
const nexmo = new Nexmo(
  {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  },
  { debug: true }
);

const sendSMS = (toNumber, text) => {
  return new Promise((resolve, reject) => {
    nexmo.message.sendSms(
      process.env.NUMBER,
      toNumber,
      text,
      { type: "unicode" },
      (err, responseData) => {
        if (err) {
          reject(err);
        } else {
          resolve(responseData);
        }
      }
    );
  });
};

module.exports = { sendSMS };
