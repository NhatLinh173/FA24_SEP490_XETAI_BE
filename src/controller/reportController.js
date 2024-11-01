const reportService = require("../service/reportService");

const createReport = async (req, res) => {
  const { reporterId, postId, description } = req.body;
  try {
    const report = await reportService.createReport(
      reporterId,
      postId,
      description
    );
    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
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
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
  }
};

module.exports = {
  createReport,
  getReportById,
  getAllReports,
  deleteReport,
};