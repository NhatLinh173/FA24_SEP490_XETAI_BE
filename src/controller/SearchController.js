const Post = require("../model/postModel")
const Comment = require("../model/postModel")
const Category = require("../model/categoryModel")

function removeVietnameseTones(str) {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return str;
}

const removeVietnameseTones2 = (str) => {
    return str
        .normalize('NFD') // Chuẩn hóa chuỗi
        .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu
        .replace(/đ/g, 'd') // Chuyển chữ "đ" thành "d"
        .replace(/Đ/g, 'D');
};

class SearchController {

    async search(req, res, next) {
        const title = req.params.keyword;
        const normalizedSearchTerm = removeVietnameseTones(title);
        const keywords = normalizedSearchTerm.split(' ').map(keyword => removeVietnameseTones(keyword));
        const orConditions = keywords.map(keyword => ({
            $expr: {
                $regexMatch: {
                    input: { $toLower: { $replaceAll: { input: '$title', find: 'đ', replacement: 'd' } } },
                    regex: new RegExp(keyword, 'i')
                }
            }
        }));
    
        var page = req.query.page || 1;
        var limitPage = 8;
    
        try {
            // Tính tổng số bài viết khớp với điều kiện tìm kiếm và thêm điều kiện isLock và isFinish
            const totalPosts = await Post.countDocuments({
                $or: orConditions,
                isLock: false,
                isFinish: false
            });
            const maxPage = Math.ceil(totalPosts / limitPage);
    
            // Sử dụng aggregate để thực hiện truy vấn và tính toán số từ khóa trùng khớp, đồng thời thêm phân trang
            const posts = await Post.aggregate([
                { $match: { $and: [{ $or: orConditions }, { isLock: false }, { isFinish: false }] } },
                {
                    $addFields: {
                        matchCount: {
                            $size: {
                                $filter: {
                                    input: keywords,
                                    as: "keyword",
                                    cond: { $regexMatch: { input: { $toLower: { $replaceAll: { input: '$title', find: 'đ', replacement: 'd' } } }, regex: new RegExp("$$keyword", 'i') } }
                                }
                            }
                        }
                    }
                },
                { $sort: { matchCount: -1 } },
                { $skip: (page - 1) * limitPage },
                { $limit: limitPage }
            ]);
    
            res.json({
                postst: posts,
                maxPage: maxPage
            });
        } catch (error) {
            res.json({ error: error });
        }
    }

   
    
    async searchByStartPointAndDestination(req, res, next) {
        const { startPoint, destination } = req.query; // Lấy startPoint và destination từ query params
        var page = req.query.page || 1;
        var limitPage = 8;
    
        // Xây dựng điều kiện tìm kiếm động
        let searchConditions = {};
    
        if (startPoint) {
            const processedStartPoint = removeVietnameseTones2(startPoint); // Xử lý loại bỏ dấu
            searchConditions.startPoint = { $regex: processedStartPoint, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
        }
    
        if (destination) {
            const processedDestination = removeVietnameseTones2(destination); // Xử lý loại bỏ dấu
            searchConditions.destination = { $regex: processedDestination, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
        }
    
        try {
            // Đếm tổng số bài viết dựa trên điều kiện tìm kiếm
            const totalPosts = await Post.countDocuments(searchConditions);
            const maxPage = Math.ceil(totalPosts / limitPage);
    
            // Tìm tất cả các post dựa trên điều kiện tìm kiếm, phân trang
            const posts = await Post
                .find(searchConditions)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limitPage)
                .limit(limitPage)
                .populate({
                    path: 'creator',
                    select: 'firstName lastName'
                });
    
            if (posts.length === 0) {
                return res.status(404).json({ message: 'Không có bài viết nào phù hợp' });
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

module.exports = new SearchController();