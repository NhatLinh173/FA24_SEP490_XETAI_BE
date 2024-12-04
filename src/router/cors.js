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
  "https://fa-24-sep-490-xetai-8bgeaipys-nhatlinh173s-projects.vercel.app",
];

const corsOptions = (req, callback) => {
  const origin = req.header("Origin");
  if (whitelist.includes(origin)) {
    callback(null, { origin: origin, credentials: true });
  } else {
    console.error(`CORS Error: Origin ${origin} is not allowed.`);
    callback(new Error("Not allowed by CORS"));
  }
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

app.use(cors(corsOptions));

module.exports = {
  cors: cors(),
  corsWhiteList: cors(corsOptions),
  cookieOptions: cookieOptions,
};
