const reportService = require("../service/reportService");
const postController = require("../controller/PostController");
const driverPostController = require("../controller/driverPostController");

const createReport = async (req, res) => {
  const { reporterId, postId, driverPostId, description } = req.body;
  try {
    const report = await reportService.createReport(
      reporterId,
      postId,
      driverPostId,
      description
    );
    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    if (
      error.message === "Report already exists for this post by this reporter."
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating report", error });
  }
};

const getReportById = async (req, res) => {
  const { reportId } = req.params;
  try {
    const report = await reportService.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving report", error });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reports", error });
  }
};

const deleteReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    const report = await reportService.deleteReport(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ message: "Reoprt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
  }
};

const getAllPostIds = async (req, res) => {
  try {
    const postIds = await reportService.getAllPostIds();
    res.status(200).json(postIds);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving post IDs", error });
  }
};

const getAllDriverPostIds = async (req, res) => {
  try {
    const driverPostIds = await reportService.getAllDriverPostIds();
    res.status(200).json(driverPostIds);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving driver post IDs", error });
  }
};

const deleteReportAndLockPost = async (req, res) => {
  const { reportId } = req.params;

  try {
    // Lấy thông tin report trước khi xóa
    const report = await reportService.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const postId = report.postId;
    const driverPostId = report.driverPostId;

    if (!postId && !driverPostId) {
      return res
        .status(400)
        .json({ message: "No associated post found in the report" });
    }

    // Xóa bài post thường nếu có
    if (postId) {
      await postController.deletePost(
        { params: { idPost: postId } },
        { status: (code) => ({ json: (message) => message }) }
      );
    }

    // Xóa bài post của tài xế nếu có
    if (driverPostId) {
      await driverPostController.deleteDriverPost(
        { params: { id: driverPostId } },
        { status: (code) => ({ json: (message) => message }) }
      );
    }

    await reportService.deleteReport(reportId);

    res.status(200).json({
      message: "Report and associated post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report and post", error });
  }
};

module.exports = {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
  getAllPostIds,
  getAllDriverPostIds,
  deleteReportAndLockPost,
};
