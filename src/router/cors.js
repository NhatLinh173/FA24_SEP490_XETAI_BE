const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const whitelist = [
  "http://localhost:3000",
  "http://13.55.38.250:3000",
  "https://fa-24-sep-490-xetai-fe-jvy4.vercel.app",
  "https://www.xehang.online",
  "https://xehang.online",
];

const corsOptions = (req, callback) => {
  callback(null, { origin: true, credentials: true });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

app.use(cors(corsOptions));

module.exports = {
  corsWhiteList: cors(corsOptions),
  cookieOptions: cookieOptions,
};
