const Post = require("../model/postModel")
const Comment = require("../model/postModel")
const Category = require("../model/categoryModel")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
//tạo post , thêm comment
class PostController {

    async createPost(req, res, next) { //đăng bài post
        const salePostDataBody = req.body;
        const newPost = new Post(salePostDataBody);
        await newPost.save()
            .then(
                (savedPost) => {
                    res.json(savedPost);
                }
            )
            .catch(
                (err) => res.status(400).json({ // Trả về status 400 (Bad Request) nếu lỗi do validation
                    message: 'Validation error',
                    error: err.message
                })
            )
    }
    async updatePost(req, res, next) { //sửa bài post
        const id = req.params.idPost;
        var bodyData = req.body;
        await Post.findOne({"_id": id})
            .then(
                (updatePost) => {
                    updatePost.title = bodyData.title; //loại hàng
                    updatePost.detail = bodyData.detail; // mô tả chi tiết
                    updatePost.images = bodyData.images; //hình ảnh 
                    updatePost.load  = bodyData.load; //trọng tải
                    updatePost.fullname = bodyData.fullname //fullname 
                    updatePost.email = bodyData.email //email 
                    updatePost.phone = bodyData.phone //sdt 
                    updatePost.startPoint  = bodyData.startPoint; //điạ chỉ nhận hàng
                    updatePost.destination = bodyData.destination; //đíạ chỉ giao hàng 
                    updatePost.category = bodyData.category; //để danh mục là xếp theo loại xe 
                    updatePost.price  = bodyData.price; //giá tiền
                    updatePost.isLock = bodyData.isLock; //khóa
                    updatePost.isFinish = bodyData.isFinish;  //hoàn thành chưa (hoàn thành r thì t ẩn )
                    updatePost.status = bodyData.status //status
                    updatePost.driver = bodyData.driver //driver
                    updatePost.creator = bodyData.creator //creator, t thấy chỗ ni update ng tạo rg rg mà thui thêm vô ưa thì dùng k thì kệ
                    updatePost.save()
                        .then(
                            (updatePost) => {
                                res.json(updatePost);
                            }
                        )
                        .catch(
                            (err) => {
                                res.status(400).json({ // Trả về status 400 (Bad Request) nếu lỗi do validation
                                    message: 'Validation error',
                                    error: err.message
                                })
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
    async showPostByUserId(req, res, next) { //hiện post theo user (truyền id user vào và hiển thị tất cả bài viết của user đó)
        const userId = req.params.idUser; 
        var page = req.query.page || 1;
        var limitPage = 8;
        var totalPosts = await Post.countDocuments({ creator: userId });
        var maxPage = Math.ceil(totalPosts / limitPage);
        
        await Post
            .find({ creator: userId })
            .sort({createdAt: -1})
            .skip((page - 1) * limitPage)
            .limit(limitPage)
            .populate({
                path: 'creator',
                select: 'firstName lastName'
            })
            .then(
                (salePosts) => {
                    res.json({
                        salePosts: salePosts,
                        maxPage: maxPage
                    })
                }
            )
            .catch(
                (err) => {
                    res.json(err)
                }
            )
    }


    async showPost(req, res, next) { //xuất hết tất cả bài post (theo thứ tự do database, chưa đi kèm random  )
        console.log("Fetching  posts...");
    var page = req.query.page || 1;
    var limitPage = 8;
    var totalPosts = await Post.countDocuments();
    console.log("Total posts:", totalPosts);
        var maxPage = Math.ceil(totalPosts / limitPage);
        await Post
            .find({isLock: false, isFinish: false})
            .sort({createdAt: -1})
            .skip((page - 1) * limitPage)
            .limit(limitPage)
            .populate({
                path: 'creator',
                select: 'firstName lastName'

            })
            // .populate({
            //     path: 'comments',
            //     populate: {
            //         path: 'userComment',
            //         model: 'User',
            //         select: 'firstName lastName'
            //     }
            // })
            .then(
                (salePosts) => {
                    res.json({
                        salePosts: salePosts,
                            maxPage: maxPage
                        }
                    )
                }
            )
            .catch(
                (err) => {
                    res.json(err)
                }
            )
    }
    async getOne(req, res, next){ //lấy 1 theo id của bài post
        const id=req.params.idPost;
        await Post.findOne({"_id":id})
            .populate({
                path: 'creator',
                select: 'firstName lastName'

            })
            // .populate({
            //     path: 'comments',
            //     populate: {
            //         path: 'userComment',
            //         model: 'User',
            //         select: 'username fullname'
            //     }
            // })
            .then(
                (salePost)=>{
                    res.json(salePost)
                }
            )
            .catch(
                err=>{
                    err
                }
            )
    }

    async getBaseOnCategory(req, res, next) { //lấy hết theo danh mục 
        const slugId = req.params.idslug;
        console.log(slugId);
        try {
            const category = await Category.find({"_id": slugId,isLock: false, isFinish: false});
    
            if (!category) {
                res.status(404).json({ error: 'Category not found' });
                return;
            }

    
            const page = parseInt(req.query.page) || 1;
            const limitPage = 8;
    
            const totalPosts = await Post.countDocuments({ "category": slugId });
            const maxPage = Math.ceil(totalPosts / limitPage);
    
            const salePosts = await Post.find({ "category": slugId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limitPage)
                .limit(limitPage)
                .populate({
                    path: 'creator',
                    select: 'username fullname'
                })
               
            res.json({ salePosts: salePosts, maxPage: maxPage });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    


    

    async addComment(req, res, next) { // chưa làm, để cho vui 
        const newComment = req.body;
        const id = req.params.idPost;
        await Post.findOne({"_id": id})
            .then(
                (salePost) => {
                    if (salePost) {
                        salePost.comments.push({
                            detail: newComment.detail,
                            userComment: newComment.userComment
                        })
                        salePost.save()
                            .then(
                                salePost => {
                                    res.json(salePost);
                                }
                            )
                            .catch(
                                err => {
                                    res.json(err);
                                }
                            )
                    } else
                        res.json("not found")

                }
            )
            .catch(
                (err) => res.json(err)
            )
    }


    async deletePost(req, res, next) { //xóa 1 bài post bằng id
        const id = req.params.idPost;
        await Post.deleteOne({"_id": id})
            .then(
                (salePost) => {
                    res.json(salePost);
                }
            )
            .catch(
                (error) => {
                    res.status(400).json({ // Trả về status 400 (Bad Request) nếu lỗi do validation
                        message: 'Validation error',
                        error: err.message
                    })
                }
            );

    }

    async getRelated(req, res, next) { // lấy theo đề mục (ngẫu nhiên 5 cái) (kiểu để xuất bài đăng liên quan , chắc ko dùng tới, viết để sẵn )
        const cateId = req.params.idCategory;
    
        await Post.aggregate([
            { 
                $match: { 
                    "category": ObjectId(cateId),
                    isLock: false,
                    isFinish: false
                } 
            },
            { $sample: { size: 5 } } // Lấy ngẫu nhiên 5 bản ghi
        ])
        .then(
            (salePosts) => {
                res.json(salePosts);
            }
        )
        .catch(
            (error) => {
                res.json({
                    error: error
                });
            }
        );
    }

    async showPostByUserIdAndStatus(req, res, next) { 
        const userId = req.params.idUser; 
        const status = req.query.status; // lấy status từ query parameter  ví dụ: ?status=approve
        var page = req.query.page || 1;
        var limitPage = 8;
    
        try {
            // Đếm tổng số bài viết dựa trên userId và status
            var totalPosts = await Post.countDocuments({ creator: userId, status: status });
            var maxPage = Math.ceil(totalPosts / limitPage);
    
            // Tìm tất cả các post dựa trên userId và status, phân trang
            const posts = await Post
                .find({ creator: userId, status: status })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limitPage)
                .limit(limitPage)
                .populate({
                    path: 'creator',
                    select: 'firstName lastName'
                });
    
            if (posts.length === 0) {
                return res.status(404).json({ message: 'Không có bài viết nào' });
            }
    
            res.json({
                salePosts: posts,
                maxPage: maxPage
            });
        } catch (err) {
            res.status(500).json({
                message: 'Lỗi khi tìm bài viết',
                error: err
            });
        }
    }

    
}

module.exports = new PostController();