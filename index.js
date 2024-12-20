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
const driverLocationWS = require("./src/socketHandler/driverLocationWS");
const notificationWS = require("./src/socketHandler/notificationHandler");
const { logVisit } = require("./src/controller/admin/adminController");
dotenv.config();
const PORT = process.env.PORT || 3005;

app.use(
  cors({
    origin: [
      "https://fa-24-sep-490-xetai-fe-jvy4.vercel.app",
      "http://localhost:3000",
      "https://xehang.online",
      "https://www.xehang.online",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json());
app.use(logVisit);
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});
routes(app);

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
      "https://fa-24-sep-490-xetai-fe-jvy4.vercel.app",
      "http://localhost:3000",
      "https://www.xehang.online",
      "https://xehang.online",
    ],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  },
});

driverLocationWS(io);
socketHandle(io);
notificationWS(io);

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
