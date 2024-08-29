const express = require("express");
const cors = require("cors");
const app = express();

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

exports.cors = cors();
exports.corsWhiteList = cors(corsOptions);
