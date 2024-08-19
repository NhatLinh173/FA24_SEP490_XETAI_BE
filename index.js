const express = require("express");
const connectDB = require("../../BE/fa24_xetai/src/config/database");
const dotenv = require("dotenv");

const app = express();
const bodyParser = require("body-parser");
dotenv.config();
const PORT = process.env.PORT || 3005;
app.use(express.json());

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
  });
