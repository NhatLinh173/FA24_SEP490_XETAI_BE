const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const whitelist = [
  "https://fa-24-sep-490-xetai-fe.vercel.app",
  "http://localhost:3000",
  "http://localhost:3005",
  "https://localhost:3443",
  "http://localhost:3006",
  "https://fa-24-sep-490-xetai-fe.vercel.app/api/user/google/callback",
  "https://fa-24-sep-490-xetai-fe.vercel.app/api/user/forgot-password",
  "https://fa-24-sep-490-xetai-ozwcon2zp-nhatlinh173s-projects.vercel.app",
  "https://fa-24-sep-490-xetai-be.vercel.app",
  "https://fa-24-sep-490-xetai-8bgeaipys-nhatlinh173s-projects.vercel.app",
];

const corsOptions = (req, callback) => {
  console.log("Origin:", req.header("Origin"));
  const origin = req.header("Origin");
  if (whitelist.includes(origin)) {
    callback(null, { origin: origin, credentials: true });
  } else {
    callback(new Error("Not allowed by CORS"));
  }
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
