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
const cookieParser = require("cookie-parser");
const { corsWhiteList, cookieOptions } = require("./src/router/cors");
dotenv.config();
const PORT = process.env.PORT || 3005;
app.use(corsWhiteList);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

routes(app);

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: true,
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
