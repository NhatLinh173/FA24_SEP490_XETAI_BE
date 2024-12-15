const reportService = require("../service/reportService");
const postController = require("../controller/PostController");
const driverPostController = require("../controller/driverPostController");
const Notification = require("../model/notificationModel");
const Post = require("../model/postModel");
const DriverPost = require("../model/driverPost");
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

    if (postId) {
      const post = await Post.findById(postId);
      if (post) {
        const notification = new Notification({
          userId: post.creator,
          title: "Vi phạm bài đăng",
          message: `Bài đăng ${postId} của bạn đã bị xóa do vi phạm quy định cộng đồng. Lý do: ${report.description}`,
          data: {
            postId: postId,
            status: "deleted",
            reason: report.description,
          },
        });
        await notification.save();

        req.io.to(post.creator.toString()).emit("receiveNotification", {
          title: "Vi phạm bài đăng",
          message: `Bài đăng ${postId} của bạn đã bị xóa do vi phạm quy định cộng đồng. Lý do: ${report.description}`,
          data: {
            postId: postId,
            status: "deleted",
            reason: report.description,
          },
          timestamp: new Date(),
        });

        await postController.deletePost(
          { params: { idPost: postId } },
          { status: (code) => ({ json: (message) => message }) }
        );
      }
    }

    if (driverPostId) {
      const driverPost = await DriverPost.findById(driverPostId);
      if (driverPost) {
        const notification = new Notification({
          userId: driverPost.creatorId,
          title: "Vi phạm bài đăng",
          message: `Bài đăng ${driverPost.creatorId} của bạn đã bị xóa do vi phạm quy định cộng đồng. Lý do: ${report.description}`,
          data: {
            driverPostId: driverPostId,
            status: "deleted",
            reason: report.description,
          },
        });
        await notification.save();

        req.io.to(driverPost.creatorId.toString()).emit("receiveNotification", {
          title: "Vi phạm bài đăng",
          message: `Bài đăng ${driverPost.creatorId} của bạn đã bị xóa do vi phạm quy định cộng đồng. Lý do: ${report.description}`,
          data: {
            driverPostId: driverPostId,
            status: "deleted",
            reason: report.description,
          },
          timestamp: new Date(),
        });

        await driverPostController.deleteDriverPost(
          { params: { id: driverPostId } },
          { status: (code) => ({ json: (message) => message }) }
        );
      }
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
