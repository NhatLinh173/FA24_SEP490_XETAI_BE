const Transaction = require("../../model/transactionModel");
const Post = require("../../model/postModel");
const Visit = require("../../model/visitModel");
const User = require("../../model/userModel");

const getSummaryData = async (req, res) => {
  try {
    // Lấy ngày tháng của tháng hiện tại
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ); // Đầu tháng này
    const currentMonthEnd = new Date(currentMonthStart);
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1); // Đến cuối tháng hiện tại

    // Tổng hợp các giao dịch
    const summary = await Transaction.aggregate([
      {
        $match: {
          type: {
            $in: [
              "POST_PAYMENT",
              "DEPOSIT",
              "RECEIVING_PAYMENT_FROM_ORDER",
              "WITHDRAW",
            ],
          },
          status: { $in: ["PAID", "COMPLETE", "COMPLETED"] },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: {
            $sum: {
              $cond: {
                if: { $eq: ["$type", "RECEIVING_PAYMENT_FROM_ORDER"] },
                then: { $multiply: ["$amount", 0.1] },
                else: "$amount",
              },
            },
          },
        },
      },
    ]);

    // Tổng hợp giao dịch trong tháng hiện tại
    const monthlySummary = await Transaction.aggregate([
      {
        $match: {
          type: {
            $in: [
              "POST_PAYMENT",
              "DEPOSIT",
              "RECEIVING_PAYMENT_FROM_ORDER",
              "WITHDRAW",
            ],
          },
          status: { $in: ["PAID", "COMPLETE", "COMPLETED"] },
          createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: {
            $sum: {
              $cond: {
                if: { $eq: ["$type", "RECEIVING_PAYMENT_FROM_ORDER"] },
                then: { $multiply: ["$amount", 0.1] },
                else: "$amount",
              },
            },
          },
        },
      },
    ]);

    const withdrawAmount =
      summary.find((item) => item._id === "WITHDRAW")?.totalAmount || 0;
    const totalAmount = summary.reduce((acc, curr) => {
      if (curr._id !== "WITHDRAW") {
        acc += curr.totalAmount;
      }
      return acc;
    }, 0);

    const finalAmount = totalAmount - withdrawAmount;

    const monthlyWithdrawAmount =
      monthlySummary.find((item) => item._id === "WITHDRAW")?.totalAmount || 0;
    const monthlyTotalAmount = monthlySummary.reduce((acc, curr) => {
      if (curr._id !== "WITHDRAW") {
        acc += curr.totalAmount;
      }
      return acc;
    }, 0);

    const monthlyFinalAmount = monthlyTotalAmount - monthlyWithdrawAmount;
    const totalOrders = await Post.find({});
    const completedOrders = await Post.find({ status: "complete" });

    const totalOrdersInSystem = totalOrders.length;
    const totalOrdersCompleted = completedOrders.length;
    const totalPrice = completedOrders.reduce((total, order) => {
      return total + parseFloat(order.price.replace(/[^0-9.-]+/g, ""));
    }, 0);

    // Trả về kết quả kết hợp
    return res.status(200).json({
      success: true,
      totalAmount: finalAmount,
      breakdown: summary,
      monthlyAmount: monthlyFinalAmount,
      monthlyBreakdown: monthlySummary,
      totalOrdersInSystem,
      totalOrdersCompleted,
      totalPrice,
      completedOrders,
      message:
        totalOrders === 0
          ? "No completed orders found"
          : "Completed orders found", // Thông báo nếu không có đơn hàng hoàn thành
    });
  } catch (error) {
    console.error("Error calculating summary data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate summary data.",
    });
  }
};

const logVisit = async (req, res, next) => {
  try {
    const visitData = {
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        "unknown",
      url: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    };

    const visit = new Visit(visitData);
    await visit.save();
    next(); // Tiếp tục xử lý request
  } catch (error) {
    console.error("Error logging visit:", error);
    next(); // Vẫn tiếp tục request dù có lỗi
  }
};

// Lấy danh sách lượt truy cập
const getVisits = async (req, res) => {
  try {
    const visits = await Visit.find().sort({ createdAt: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching visits", error });
  }
};

const getStats = async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();

    const visitsByUrl = await Visit.aggregate([
      { $group: { _id: "$url", count: { $sum: 1 } } },
    ]);

    // Tính lượt truy cập theo ngày
    const visitsByDay = await Visit.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalVisits, visitsByUrl, visitsByDay });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};

const getCustomerAnalysis = async (req, res) => {
  try {
    const allUsers = await User.find({
      role: { $in: ["customer", "personal"] },
    });

    let newCustomers = 0;
    let returningCustomers = 0;

    for (let user of allUsers) {
      const visits = await Visit.find({ userId: user._id });

      const firstVisitDate = visits.length > 0 ? visits[0].visitDate : null;

      if (
        firstVisitDate &&
        new Date(firstVisitDate) > new Date(user.createdAt)
      ) {
        returningCustomers++;
      } else {
        newCustomers++;
      }
    }

    res.json({
      newCustomers,
      returningCustomers,
      totalCustomers: allUsers.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customer analysis", error });
  }
};

module.exports = {
  getSummaryData,
  logVisit,
  getVisits,
  getStats,
  getCustomerAnalysis,
};
