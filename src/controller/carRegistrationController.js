const CarRegistration = require("../model/carRegistrationModel");
const cloudinary = require("../config/cloudinaryConfig");

const createCarRegistration = async (req, res) => {
  const { nameCar, driverId, licensePlate, registrationDate, load, expirationDate } = req.body;
  const { imageCar, imageRegistration } = req.files;

  if (!nameCar || !driverId || !imageCar || !imageRegistration || !licensePlate || !registrationDate || !load || !expirationDate) {
    return res.status(400).json({ message: "Invalid information" });
  }

  try {
    let imageCarUrls = [];
    let imageRegistrationUrls = [];

    if (imageCar && imageCar.length > 0) {
      const uploadCarPromises = imageCar.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "car_images" }, (error, result) => {
              if (error) {
                reject(new Error("Error uploading image to Cloudinary: " + error.message));
              } else {
                resolve(result.secure_url);
              }
            })
            .end(file.buffer);
        });
      });

      imageCarUrls = await Promise.all(uploadCarPromises);
    }

    if (imageRegistration && imageRegistration.length > 0) {
      const uploadRegistrationPromises = imageRegistration.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "car_registration_images" }, (error, result) => {
              if (error) {
                reject(new Error("Error uploading image to Cloudinary: " + error.message));
              } else {
                resolve(result.secure_url);
              }
            })
            .end(file.buffer);
        });
      });

      imageRegistrationUrls = await Promise.all(uploadRegistrationPromises);
    }

    const newCarRegistration = new CarRegistration({
      nameCar,
      imageCar: imageCarUrls,
      imageRegistration: imageRegistrationUrls,
      driverId,
      licensePlate,
      registrationDate,
      load,
      expirationDate,
    });

    await newCarRegistration.save();
    res.status(200).json(newCarRegistration);
  } catch (error) {
    res.status(400).json({ message: "Unable to create car registration", error });
  }
};

const getAllCarRegistrations = async (req, res) => {
  try {
    const carRegistrations = await CarRegistration.find().populate({
      path: "driverId",
      populate: {
        path: "userId",
        model: "User",
      },
    });
    res.status(200).json(carRegistrations);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch car registrations", error });
  }
};

const getCarRegistrationById = async (req, res) => {
  const { id } = req.params;

  try {
    const carRegistration = await CarRegistration.findById(id).populate({
      path: "driverId",
      populate: {
        path: "userId",
        model: "User",
      },
    });

    if (!carRegistration) {
      return res.status(404).json({ message: "Car registration not found" });
    }

    res.status(200).json(carRegistration);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch car registration", error });
  }
};

const updateCarRegistration = async (req, res) => {
  const { id } = req.params;
  const { nameCar, description, status, load, licensePlate, registrationDate } = req.body;
  const { imageCar, imageRegistration } = req.files;

  try {
    const currentRegistration = await CarRegistration.findById(id);
    if (!currentRegistration) {
      return res.status(404).json({ message: "Car registration not found" });
    }

    let imageCarUrls = currentRegistration.imageCar || [];
    let imageRegistrationUrls = currentRegistration.imageRegistration || [];

    if (imageCar && imageCar.length > 0) {
      const uploadCarPromises = imageCar.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "car_images" }, (error, result) => {
              if (error) {
                reject(new Error("Error uploading image to Cloudinary: " + error.message));
              } else {
                resolve(result.secure_url);
              }
            })
            .end(file.buffer);
        });
      });

      imageCarUrls = await Promise.all(uploadCarPromises);
    }

    if (imageRegistration && imageRegistration.length > 0) {
      const uploadRegistrationPromises = imageRegistration.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "car_registration_images" }, (error, result) => {
              if (error) {
                reject(new Error("Error uploading image to Cloudinary: " + error.message));
              } else {
                resolve(result.secure_url);
              }
            })
            .end(file.buffer);
        });
      });

      imageRegistrationUrls = await Promise.all(uploadRegistrationPromises);
    }

    const updatedCarRegistration = await CarRegistration.findByIdAndUpdate(
      id,
      {
        nameCar,
        description,
        imageCar: [...imageCarUrls, ...currentRegistration.imageCar],
        imageRegistration: [...imageRegistrationUrls, ...currentRegistration.imageRegistration],
        status,
        load,
        registrationDate,
        licensePlate,
      },
      { new: true }
    ).populate({
      path: "driverId",
      populate: {
        path: "userId",
        model: "User",
      },
    });

    res.status(200).json(updatedCarRegistration);
  } catch (error) {
    res.status(400).json({ message: "Unable to update car registration", error });
  }
};

const deleteCarRegistration = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    const deletedCarRegistration = await CarRegistration.findByIdAndDelete(id);

    if (!deletedCarRegistration) {
      return res.status(404).json({ message: "Car registration not found" });
    }

    res.status(200).json({ message: "Car registration deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Unable to delete car registration", error });
  }
};

const updateCarRegistrationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  try {
    const updatedCarRegistration = await CarRegistration.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedCarRegistration) {
      return res.status(404).json({ message: "Car registration not found" });
    }

    res.status(200).json(updatedCarRegistration);
  } catch (error) {
    res.status(400).json({ message: "Unable to update car registration status", error });
  }
};

const getCarRegistrationsByDriverId = async (req, res) => {
  const { driverId } = req.params;
  if (!driverId) {
    return res.status(400).json({ message: "driverId is required" });
  }

  try {
    const registrations = await CarRegistration.find({ driverId }).populate({
      path: "driverId",
      populate: {
        path: "userId",
        model: "User",
      },
    });

    if (registrations.length === 0) {
      return res.status(404).json({ message: "No registrations found for this driver" });
    }

    res.status(200).json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCarRegistrationsByDriverIdAndStatus = async (req, res) => {
  const { driverId } = req.params;

  if (!driverId) {
    return res.status(400).json({ message: "driverId is required" });
  }

  try {
    const registrations = await CarRegistration.find({
      driverId,
      status: "approved",
    }).populate({
      path: "driverId",
      populate: {
        path: "userId",
        model: "User",
      },
    });

    if (registrations.length === 0) {
      return res.status(404).json({ message: "No approved registrations found for this driver" });
    }

    res.status(200).json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCarRegistration,
  getAllCarRegistrations,
  getCarRegistrationById,
  updateCarRegistration,
  deleteCarRegistration,
  updateCarRegistrationStatus,
  getCarRegistrationsByDriverId,
  getCarRegistrationsByDriverIdAndStatus,
};
