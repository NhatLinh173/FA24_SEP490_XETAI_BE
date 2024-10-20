const userRouter = require("../router/auth");
const searchRouter = require("./search");
const postsRouter = require("./posts");
const categoriesRouter = require("./categories");
const paymentRouter = require("./payment");
const ratingRouter = require("./rating");
const favoritesRouter = require("./favoriteDriverRouter");
const sendEmailRouter = require("./emailRouter");
const conversationRouter = require("./conversationRouter");
const dealPriceRouter = require("./dealPrice");
const carRegistrationRouter = require("./carRegistration");

const router = (app) => {
  app.use("/auth", userRouter);
  app.use("/posts", postsRouter);
  app.use("/categories", categoriesRouter);
  app.use("/search", searchRouter);
  app.use("/payment", paymentRouter);
  app.use("/rating", ratingRouter);
  app.use("/favorites", favoritesRouter);
  app.use("/driver", favoritesRouter);
  app.use("/send", sendEmailRouter);
  app.use("/conversation", conversationRouter);
  app.use("/dealPrice", dealPriceRouter);
  app.use("/car", carRegistrationRouter);
};

module.exports = router;
