const reportService = require("../service/reportService");
const postController = require("../controller/PostController");
const driverPostController = require("../controller/driverPostController");



const createReport = async (req, res) => {
  const { reporterId, postId, driverPostId, description } = req.body;
  try {
    const report = await reportService.createReport(reporterId, postId, driverPostId, description);
    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    if (error.message === "Report already exists for this post by this reporter.") {
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
    res.status(500).json({ message: "Error retrieving driver post IDs", error });
  }
};

const deleteReportAndLockPost = async (req, res) => {
  const { reportId } = req.params;

  try {
    // Xóa báo cáo
    const report = await reportService.deleteReport(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Lấy thông tin bài đăng liên kết (Post hoặc DriverPost)
    const postId = report.postId; // Trường hợp Post
    const driverPostId = report.driverPostId; // Trường hợp DriverPost

    // Nếu không có cả postId và driverPostId
    if (!postId && !driverPostId) {
      return res.status(400).json({ message: "No associated post found in the report" });
    }

    // Nếu có postId (Post) - gọi hàm updatePostStatus
    if (postId) {
      const updateStatusResult = await postController.updatePostStatus(
        { params: { idPost: postId }, body: { status: "locked" } }, // Yêu cầu giả lập cho Post
        {
          status: (code) => ({ json: (message) => message }), // Giả lập response object
        }
      );

      if (updateStatusResult.error) {
        return res.status(500).json({
          message: "Error updating post status after deleting report",
          error: updateStatusResult.error,
        });
      }
    }

    // Nếu có driverPostId (DriverPost) - gọi hàm updateDriverPostStatus
    if (driverPostId) {
      const updateDriverPostStatusResult = await driverPostController.updateDriverPostStatus(
        { params: { id: driverPostId }, body: { status: "locked" } }, // Yêu cầu giả lập cho DriverPost
        {
          status: (code) => ({ json: (message) => message }), // Giả lập response object
        }
      );

      if (updateDriverPostStatusResult.error) {
        return res.status(500).json({
          message: "Error updating driver post status after deleting report",
          error: updateDriverPostStatusResult.error,
        });
      }
    }

    res.status(200).json({
      message: "Report deleted and post status updated to locked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
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
