const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const whitelist = [
  "https://fa-24-sep-490-xetai-fe.vercel.app",
  "http://localhost:3000",
  "http://localhost:3005",
  "https://localhost:3443",
  "http://localhost:3006",
  "http://localhost:3005/api/user/google/callback",
  "http://localhost:3005/api/user/forgot-password",
  "https://fa-24-sep-490-xetai-be.vercel.app/",
];

const corsOptions = (req, callback) => {
  let corsOptions = { origin: false };
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: req.header("Origin"), credentials: true };
  }
  callback(null, corsOptions);
};

const cookieOptions = {
  httpOnly: true,
  secure: false,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

app.use(cors(corsOptions));

module.exports = {
  cors: cors(),
  corsWhiteList: cors(corsOptions),
  cookieOptions: cookieOptions,
};
