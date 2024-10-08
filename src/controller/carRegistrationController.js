const CarRegistration = require("../model/carRegistrationModel");
const cloudinary = require("../config/cloudinaryConfig");

const createCarRegistration = async (req, res) => {
  const { nameCar, description, driverId } = req.body;
  const imageFiles = req.files;

  try {
    let imageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) => {
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

      imageUrls = await Promise.all(uploadPromises);
    }

    const newCarRegistration = new CarRegistration({
      nameCar,
      description,
      image: imageUrls,
      driverId,
    });

    await newCarRegistration.save();
    res.status(200).json(newCarRegistration);
  } catch (error) {
    res.status(400).json({ message: "Unable to create car registration", error });
  }
};

const getAllCarRegistrations = async (req, res) => {
  try {
    const carRegistrations = await CarRegistration.find().populate("driverId");
    res.status(200).json(carRegistrations);
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch car registrations", error });
  }
};

const getCarRegistrationById = async (req, res) => {
  const { id } = req.params;

  try {
    const carRegistration = await CarRegistration.findById(id).populate("driverId");

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
  const { nameCar, description, status } = req.body;
  const imageFiles = req.files;

  try {
    let imageUrls = req.body.image || [];

    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) => {
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

      imageUrls = await Promise.all(uploadPromises);
    }

    const updatedCarRegistration = await CarRegistration.findByIdAndUpdate(
      id,
      {
        nameCar,
        description,
        image: imageUrls,
        status,
      },
      { new: true }
    );

    if (!updatedCarRegistration) {
      return res.status(404).json({ message: "Car registration not found" });
    }

    res.status(200).json(updatedCarRegistration);
  } catch (error) {
    res.status(400).json({ message: "Unable to update car registration", error });
  }
};

const deleteCarRegistration = async (req, res) => {
  const { id } = req.params;

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

module.exports = {
  createCarRegistration,
  getAllCarRegistrations,
  getCarRegistrationById,
  updateCarRegistration,
  deleteCarRegistration,
  updateCarRegistrationStatus,
};
