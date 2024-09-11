const userRouter = require("../router/auth");
const paymentRouter = require("./payment");
const router = (app) => {
  app.use("/auth", userRouter);
  app.use("/payment", paymentRouter);
};

module.exports = router;
