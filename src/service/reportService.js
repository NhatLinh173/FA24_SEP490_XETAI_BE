const Report = require("../model/reportModel");
const User = require("../model/userModel");
const Post = require("../model/postModel");

const createReport = async (reporterId, postId, driverPostId, description) => {
  const existingReport = await Report.findOne({
    reporterId,
    postId,
    driverPostId,
  });

  if (existingReport) {
    throw new Error("Report already exists for this post by this reporter.");
  }

  const report = new Report({ reporterId, postId, description, driverPostId });
  return await report.save();
};

const getReportById = async (reportId) => {
  return await Report.findById(reportId)
    .populate("reporterId", "fullName email phone avatar") // Thông tin đầy đủ của user
    .populate({
      path: "postId",
      populate: [
        { path: "creator", select: "name email phone" }, // Thông tin người tạo post
        { path: "dealId" }, // Thông tin giao dịch nếu có
      ],
    })
    .populate({
      path: "driverPostId",
      populate: [
        { path: "creatorId", select: "name email phone avatar" }, // Thông tin creator của driver post
      ],
    });
};

const getAllReports = async () => {
  return await Report.find()
    .populate("reporterId", "fullName email phone avatar")
    .populate({
      path: "postId",
      populate: [{ path: "creator", select: "name email phone" }, { path: "dealId" }],
    })
    .populate({
      path: "driverPostId",
      populate: [{ path: "creatorId", select: "name email phone avatar" }],
    });
};

const deleteReport = async (reportId) => {
  return await Report.findByIdAndDelete(reportId);
};

const getAllPostIds = async () => {
  return await Report.find({ driverPostId: null })
    .populate("reporterId", "fullName email phone avatar")
    .populate({
      path: "postId",
      populate: [{ path: "creator", select: "name email phone" }, { path: "dealId" }],
    });
};

const getAllDriverPostIds = async () => {
  return await Report.find({ postId: null })
    .populate("reporterId", "fullName email phone avatar")
    .populate({
      path: "driverPostId",
      populate: [
        {
          path: "creatorId",
          populate: {
            path: "userId",
            select: "fullName email phone avatar",
          },
        },
      ],
    });
};

module.exports = {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
  getAllPostIds,
  getAllDriverPostIds,
};
