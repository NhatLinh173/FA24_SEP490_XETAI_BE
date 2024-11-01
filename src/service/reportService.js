const Report = require("../model/reportModel");
const User = require("../model/userModel");
const Post = require("../model/postModel");

const createReport = async (reporterId, postId, description) => {
  const report = new Report({ reporterId, postId, description });
  return await report.save();
};

const getReportById = async (reportId) => {
  return await Report.findById(reportId)
    .populate("reporterId", "fullName email")
    .populate({
      path: "postId",
      populate: [{ path: "creator" }, { path: "dealId" }],
    });
};

const getAllReports = async () => {
  return await Report.find()
    .populate("reporterId", "fullName email")
    .populate({
      path: "postId",
      populate: [{ path: "creator" }, { path: "dealId" }],
    });
};

const deleteReport = async (reportId) => {
  return await Report.findByIdAndDelete(reportId);
};

module.exports = {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
};