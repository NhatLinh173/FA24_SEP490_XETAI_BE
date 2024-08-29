const Post = require("../model/postModel")
const Comment = require("../model/postModel")
const Category = require("../model/categoryModel")

function removeVietnameseTones(str) {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return str;
}

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
    
}

module.exports = new SearchController();