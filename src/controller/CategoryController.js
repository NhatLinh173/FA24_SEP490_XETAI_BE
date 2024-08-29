const Category = require("../model/categoryModel")


class CategoryController { //lẩy ra , thêm , sửa , xóa

    async getCategory(req, res, next) { //lấy ra
        const id = req.params.idCategory;
        await Category.find({"_id": id})
            .then(
                (category) => {
                    res.json(category);
                }
            )
            .catch(
                (error) => {
                    res.json({
                        error: error
                    })
                }
            );

    }

    async getAllCategory(req, res, next) { //lấy ra hết
        await Category.find()
            .then(
                (category) => {
                    res.json(category);
                }
            )
            .catch(
                (error) => {
                    res.json({
                        error: error
                    })
                }
            );

    }


    async addCategory(req, res, next) { //thêm 
        await Category.create(req.body)
            .then(
                (category) => {
                    res.json(category);
                }
            )
            .catch(
                (err) => {
                    res.status(500);
                    res.json(err);

                }
            )


    }

    async updateCategory(req, res, next) { //sửa
        const id = req.params.idCategory;
        var bodyData = req.body;
        await Category.findOne({"_id": id})
            .then(
                (category) => {
                    category.name = bodyData.name;
                    category.description = bodyData.description;
                    category.save()
                        .then(
                            (category) => {
                                res.json(category);
                            }
                        )
                        .catch(
                            (err) => {
                                res.json(err);
                            }
                        )
                }
            )
            .catch(
                (error) => {
                    res.json({
                        error: error
                    })
                }
            );

    }



    async deleteCategory(req, res, next) { //xóa
        const id = req.params.idCategory;
        await Category.deleteOne({"_id": id})
            .then(
                (category) => {
                    res.json(category);
                }
            )
            .catch(
                (error) => {
                    res.json({
                        error: error
                    })
                }
            );

    }

    async deleteAllCategory(req, res, next) { //xóa hết
        await Category.deleteMany()
            .then(
                (category) => {
                    res.json(category);
                }
            )
            .catch(
                (error) => {
                    res.json({
                        error: error
                    })
                }
            );
    }

}

module.exports = new CategoryController();