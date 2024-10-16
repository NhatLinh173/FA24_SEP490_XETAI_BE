const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Danh sách whitelist cho CORS
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3005",
  "https://localhost:3443",
  "http://localhost:3006",
  "http://localhost:3005/api/user/google/callback",
  "http://localhost:3005/api/user/forgot-password",
];

const corsOptions = (req, callback) => {
  const corsOptions = {
    origin: whitelist.indexOf(req.header("Origin")) !== -1,
    credentials: true,
  };
  callback(null, corsOptions);
};

const cookieOptions = {
  httpOnly: true,
  secure: false, 
  maxAge: 1000 * 60 * 60 * 24 * 7, 
};

// Xuất các middleware
module.exports = {
  cors: cors(), // Nếu cần sử dụng CORS mà không kiểm tra whitelist
  corsWhiteList: cors(corsOptions), // CORS với whitelist
  cookieOptions: cookieOptions,
};
