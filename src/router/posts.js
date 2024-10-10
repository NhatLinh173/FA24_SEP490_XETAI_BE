const express = require("express");
const router = express.Router();
const postController = require("../controller/PostController");

router.post("/", postController.createPost);
router.get("/", postController.showPost);
router.get("/:idUser/users", postController.showPostByUserId);
router.patch("/:idPost", postController.updatePost);
router.get("/:idPost", postController.getOne);
router.get("/filter/:idslug", postController.getBaseOnCategory);
router.delete("/:idPost", postController.deletePost);
router.put("/:idPost/comments", postController.addComment); //CHƯA LÀM
router.get("/related/:idCategory", postController.getRelated); //lấy ngẫu nhiên 5 cái có chung category của bài post đang xem
router.get("/:idUser/users/history", postController.showHistory);
module.exports = router;
