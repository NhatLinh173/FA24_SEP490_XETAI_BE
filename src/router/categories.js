const express = require("express");
const router = express.Router();
const categoryController = require("../controller/CategoryController");

router.post("/", categoryController.addCategory); //them category
router.get("/", categoryController.getAllCategory); //lay het category
router.get("/:idCategory", categoryController.getCategory); // lay 1 category
router.put("/:idCategory", categoryController.updateCategory); //update
router.delete("/:idCategory", categoryController.deleteCategory); //xoa 1
router.delete("/", categoryController.deleteAllCategory); //xoa het

module.exports = router;
