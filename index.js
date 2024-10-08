const express = require("express");
const connectDB = require("./src/config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIO = require("socket.io");
const routes = require("./src/router/index");
const socketHandle = require("./src/socketHandler/socketHandle");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./src/service/authGoogle");

dotenv.config();
const PORT = process.env.PORT || 3005;
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
routes(app);
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3006",
    method: ["GET", "POST"],
  },
});

socketHandle(io);

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
  });
