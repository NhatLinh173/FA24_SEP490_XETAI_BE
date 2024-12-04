const express = require("express");
const connectDB = require("./src/config/database");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIO = require("socket.io");
const routes = require("./src/router/index");
const socketHandle = require("./src/socketHandler/socketHandle");
const http = require("http");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./src/service/authGoogle");
const cookieParser = require("cookie-parser");
const driverLocationWS = require("./src/socketHandler/driverLocationWS");
const notificationWS = require("./src/socketHandler/notificationHandler");
const { logVisit } = require("./src/controller/admin/adminController");
const { corsWhiteList, cookieOptions } = require("./src/router/cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

connectDB()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) =>
    console.error("Failed to connect to MongoDB:", error.message)
  );

app.use(corsWhiteList);
app.options("*", corsWhiteList); // Đảm bảo xử lý preflight request
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(logVisit);

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
      "https://fa-24-sep-490-xetai-fe.vercel.app",
      "https://fa-24-sep-490-xetai-ozwcon2zp-nhatlinh173s-projects.vercel.app",
      "https://fa-24-sep-490-xetai-8bgeaipys-nhatlinh173s-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

driverLocationWS(io);
socketHandle(io);
notificationWS(io);

routes(app);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
