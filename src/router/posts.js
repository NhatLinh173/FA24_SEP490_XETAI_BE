const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const postController = require("../controller/PostController");

router.post("/", upload.array("images", 10), postController.createPost);
router.get("/", postController.showPost);
router.get("/:idUser/users", postController.showPostByUserId);
<<<<<<< HEAD
router.get("/:driverId/driver", postController.showPostByDriverId);
router.patch("/:idPost", upload.array("newImages", 10), postController.updatePost);
=======
router.patch("/:idPost", upload.array("images", 10), postController.updatePost);
>>>>>>> c332954a630645f31fe751cb01e15fe2c243c5f8
router.get("/:idPost", postController.getOne);
router.get("/filter/:idslug", postController.getBaseOnCategory);
router.delete("/:idPost", postController.deletePost);
router.put("/:idPost/comments", postController.addComment); //CHƯA LÀM
router.get("/related/:idCategory", postController.getRelated); 
router.get("/:idUser/users/history", postController.showHistory);
router.patch("/time/:idPost", postController.setTimes);
router.patch("/:postId/deal", postController.updateDealId);
module.exports = router;
