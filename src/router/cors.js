const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3005",
  "https://localhost:3443",
  "http://localhost:3006",
  "http://localhost:3005/api/user/google/callback",
  "http://localhost:3005/api/user/forgot-password",
];

const corsOptions = (req, callback) => {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

module.exports = {
  cors: cors(),
  corsWhiteList: cors(corsOptions),
  cookieOptions: cookieOptions,
};
