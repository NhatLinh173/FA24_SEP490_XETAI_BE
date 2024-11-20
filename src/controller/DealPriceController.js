const Deal = require("../model/dealPriceModel");
const Post = require("../model/postModel");
const User = require("../model/userModel");
const Driver = require("../model/driverModel");
const mongoose = require("mongoose");

const createDeal = async (req, res) => {
  const { postId, driverId, dealPrice, estimatedTime } = req.body;

  try {
    const newDeal = new Deal({
      postId,
      driverId,
      dealPrice,
      estimatedTime,
    });

    await newDeal.save();

    res.status(200).json(newDeal);
  } catch (error) {
    res.status(400).json({ message: "Unable to create deal", error });
  }
};

const updateDealPrice = async (req, res) => {
  const { dealPrice, dealId } = req.body;

  try {
    const updatedDeal = await Deal.findByIdAndUpdate(dealId, { dealPrice }, { new: true });

    if (!updatedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json(updatedDeal);
  } catch (error) {
    res.status(400).json({ message: "Unable to update deal price", error });
  }
};

const deleteDeal = async (req, res) => {
  const { dealId } = req.body;

  try {
    const deletedDeal = await Deal.findByIdAndDelete(dealId);

    if (!deletedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Unable to delete deal", error });
  }
};

const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate("postId")
      .populate({
        path: "driverId",
        populate: {
          path: "userId",
          model: "User",
        },
      });
    res.status(200).json(deals);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch deals", error });
  }
};

const getDealById = async (req, res) => {
  const { dealId } = req.body;

  try {
    const deal = await Deal.findById(dealId)
      .populate("postId")
      .populate({
        path: "driverId",
        populate: {
          path: "userId",
          model: "User",
        },
      });
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json(deal);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch deal", error });
  }
};

const updateDealStatus = async (req, res) => {
  const { postId } = req.params;
  const { dealId, status } = req.body;

  try {
    const updatedDeal = await Deal.findByIdAndUpdate(dealId, { status }, { new: true });

    if (!updatedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    const updatePostData = {
      dealId,
      status,
    };

    if (status === "approve") {
      updatePostData.price = updatedDeal.dealPrice;
    }

    const updatePost = await Post.findByIdAndUpdate(postId, updatePostData, {
      new: true,
    });

    if (!updatePost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      updatedDeal,
      updatePost,
    });
  } catch (error) {
    res.status(400).json({ message: "Unable to update deal status", error });
  }
};

const getDealsByDriverId = async (req, res) => {
  const { driverId } = req.params;

  try {
    const deals = await Deal.find({
      driverId,
    })
      .populate({ path: "postId", populate: { path: "dealId", model: "Deal" } })
      .populate({
        path: "driverId",
        populate: {
          path: "userId",
          model: "User",
        },
      });

    if (!deals || deals.length === 0) {
      return res.status(404).json({ message: "No deals found for this driver" });
    }

    res.status(200).json(deals);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch deals", error });
  }
};

const getDealsByPostIdAndStatusWait = async (req, res) => {
  const { postId } = req.params;

  try {
    const deals = await Deal.find({
      postId,
      status: "wait",
    })
      .populate("postId")
      .populate({
        path: "driverId",
        populate: {
          path: "userId",
          model: "User",
        },
      });

    if (!deals || deals.length === 0) {
      return res.status(404).json({ message: "No waiting deals found for this post" });
    }

    res.status(200).json(deals);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch waiting deals", error });
  }
};

module.exports = {
  createDeal,
  getAllDeals,
  getDealById,
  updateDealPrice,
  updateDealStatus,
  deleteDeal,
  getDealsByDriverId,
  getDealsByPostIdAndStatusWait,
};
