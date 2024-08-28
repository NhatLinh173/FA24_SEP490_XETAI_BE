const userRouter = require("../router/auth");

const router = (app) => {
  app.use("/auth", userRouter);
};

module.exports = router;
