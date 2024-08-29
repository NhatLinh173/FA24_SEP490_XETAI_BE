const userRouter = require("../router/auth");
const searchRouter = require("./search")
const postsRouter = require("./posts");
const categoriesRouter = require("./categories");
const router = (app) => {
  app.use("/auth", userRouter);

  app.use("/posts", postsRouter);
  app.use("/categories", categoriesRouter);
  app.use("/search",searchRouter);
};

module.exports = router;
