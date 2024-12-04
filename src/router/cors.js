const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const whitelist = [
  "http://localhost:3000", // Cổng của client trong môi trường phát triển
  "http://13.55.38.250:3000",
  "https://fa-24-sep-490-xetai-fe.vercel.app",
];

const corsOptions = (req, callback) => {
  callback(null, { origin: true, credentials: true });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Cấu hình cookie chỉ sử dụng qua HTTPS trong môi trường production
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

app.use(cors(corsOptions));

module.exports = {
  corsWhiteList: cors(corsOptions),
  cookieOptions: cookieOptions,
};
