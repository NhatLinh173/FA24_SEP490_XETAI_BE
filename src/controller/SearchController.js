const Post = require("../model/postModel");
const Comment = require("../model/postModel");
const Category = require("../model/categoryModel");
const DriverPost = require("../model/driverPost");
function removeVietnameseTones(str) {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  return str;
}

function removeVietnameseTones2(str) {
  return str
    .normalize("NFD") // Chuyển ký tự tiếng Việt thành dạng tổ hợp
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu kết hợp
    .replace(/đ/g, "d") // Thay thế ký tự đ thành d
    .replace(/Đ/g, "D")
    .toLowerCase(); // Đảm bảo tất cả đều là chữ thường
}

class SearchController {
  async search(req, res, next) {
    const title = req.params.keyword;
    const normalizedSearchTerm = removeVietnameseTones(title);
    const keywords = normalizedSearchTerm
      .split(" ")
      .map((keyword) => removeVietnameseTones(keyword));
    const orConditions = keywords.map((keyword) => ({
      $expr: {
        $regexMatch: {
          input: {
            $toLower: {
              $replaceAll: { input: "$title", find: "đ", replacement: "d" },
            },
          },
          regex: new RegExp(keyword, "i"),
        },
      },
    }));

    var page = req.query.page || 1;
    var limitPage = 8;

    try {
      // Tính tổng số bài viết khớp với điều kiện tìm kiếm và thêm điều kiện isLock và isFinish
      const totalPosts = await Post.countDocuments({
        $or: orConditions,
        isLock: false,
        isFinish: false,
      });
      const maxPage = Math.ceil(totalPosts / limitPage);

      // Sử dụng aggregate để thực hiện truy vấn và tính toán số từ khóa trùng khớp, đồng thời thêm phân trang
      const posts = await Post.aggregate([
        {
          $match: {
            $and: [
              { $or: orConditions },
              { isLock: false },
              { isFinish: false },
            ],
          },
        },
        {
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: keywords,
                  as: "keyword",
                  cond: {
                    $regexMatch: {
                      input: {
                        $toLower: {
                          $replaceAll: {
                            input: "$title",
                            find: "đ",
                            replacement: "d",
                          },
                        },
                      },
                      regex: new RegExp("$$keyword", "i"),
                    },
                  },
                },
              },
            },
          },
        },
        { $sort: { matchCount: -1 } },
        { $skip: (page - 1) * limitPage },
        { $limit: limitPage },
      ]);

      res.json({
        postst: posts,
        maxPage: maxPage,
      });
    } catch (error) {
      res.json({ error: error });
    }
  }

  async searchByStartPointAndDestination(req, res, next) {
    const { startPointCity, destinationCity, load } = req.query;
    const page = parseInt(req.query.page) || 1; // Số trang, mặc định là trang 1
    const limitPage = 8; // Số lượng bài post mỗi trang

    // Tạo object chứa điều kiện tìm kiếm
    const filters = {};

    if (startPointCity) {
      filters.startPointCity = { $regex: new RegExp(startPointCity, "i") };
    }

    if (destinationCity) {
      filters.destinationCity = { $regex: new RegExp(destinationCity, "i") };
    }

    if (load) {
      const loadValue = parseFloat(load);
      const minLoad = loadValue * 0.5;
      const maxLoad = loadValue * 1.5;
      filters.load = { $gte: minLoad, $lte: maxLoad };
    }

    try {
      // Đếm tổng số bài viết theo điều kiện
      const totalPosts = await Post.countDocuments(filters);
      const maxPage = Math.ceil(totalPosts / limitPage);

      // Tìm kiếm bài viết dựa trên điều kiện với phân trang
      const posts = await Post.find(filters)
        .sort({ createdAt: -1 }) // Sắp xếp bài đăng mới nhất lên đầu
        .skip((page - 1) * limitPage)
        .limit(limitPage)
        .populate({
          path: "creator",
          select: "firstName lastName",
        });
      res.json({
        message: "Danh sách bài đăng tìm kiếm theo địa chỉ",
        posts: posts,
        currentPage: page,
        totalPosts: totalPosts,
        maxPage: maxPage,
      });
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi tìm kiếm bài đăng",
        error: err.message,
      });
    }
  }

  async searchPostDriver(req, res, next) {
    const { startCity, destinationCity } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limitPage = 8;

    // Tạo object chứa điều kiện tìm kiếm
    const filters = {};

    if (startCity) {
      filters.startCity = { $regex: new RegExp(startCity, "i") };
    }

    if (destinationCity) {
      filters.destinationCity = { $regex: new RegExp(destinationCity, "i") };
    }

    try {
      const totalPosts = await DriverPost.countDocuments(filters);
      const maxPage = Math.ceil(totalPosts / limitPage);

      const posts = await DriverPost.find(filters)
        .sort({ createdAt: -1 })
        .populate({
          path: "creatorId",
          select: "fullName",
        });

      res.json({
        message: "Danh sách bài đăng tìm kiếm theo địa chỉ",
        posts: posts,
        currentPage: page,
        totalPosts: totalPosts,
        maxPage: maxPage,
      });
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi tìm kiếm bài đăng",
        error: err.message,
      });
    }
  }
}

module.exports = new SearchController();
