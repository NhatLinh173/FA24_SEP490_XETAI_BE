const Deal = require("../model/dealPriceModel");
const mongoose = require("mongoose");

const createDeal = async (req, res) => {
  const { postId, driverId, dealPrice } = req.body;
  try {
    const newDeal = new Deal({
      postId,
      driverId,
      dealPrice,
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
    const deals = await Deal.find().populate("postId").populate("driverId");

    res.status(200).json(deals);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch deals", error });
  }
};

const getDealById = async (req, res) => {
  const { dealId } = req.body;

  try {
    const deal = await Deal.findById(dealId).populate("postId").populate("driverId");

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json(deal);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch deal", error });
  }
};

const updateDealStatus = async (req, res) => {
  const { dealId, status } = req.body;

  try {
    const updatedDeal = await Deal.findByIdAndUpdate(dealId, { status }, { new: true });

    if (!updatedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json(updatedDeal);
  } catch (error) {
    res.status(400).json({ message: "Unable to update deal status", error });
  }
};

module.exports = {
  createDeal,
  getAllDeals,
  getDealById,
  updateDealPrice,
  updateDealStatus,
  deleteDeal,
};
