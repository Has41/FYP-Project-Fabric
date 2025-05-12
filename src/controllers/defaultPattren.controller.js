import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { DefaultPattren } from "../models/defaultPattren.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addPattren = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name?.trim()) {
      throw new ApiError(400, "Pattren name is required");
    }

    let files = [];
    if (req.file) {
      files = [req.file];
    } else if (req.files && Array.isArray(req.files)) {
      files = req.files;
    } else {
      throw new ApiError(400, "No file uploaded");
    }

    const createdPattrens = [];

    for (const file of files) {
      // Upload to Cloudinary
      const uploadResult = await uploadOnCloudinary(file.path);
      if (!uploadResult?.secure_url || !uploadResult?.public_id) {
        throw new ApiError(500, "Failed to upload pattren to Cloudinary");
      }

      // Create pattren document
      const pattren = await DefaultPattren.create({
        name: name.trim(),
        image: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      });

      createdPattrens.push(pattren);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdPattrens, "Pattren(s) added successfully"));

  } catch (error) {
    next(error);
  }
});

const deletePattren = asyncHandler(async (req, res, next) => {
  try {
    const { pattrenId } = req.params;

    // Validate pattren ID
    if (!mongoose.Types.ObjectId.isValid(pattrenId)) {
      throw new ApiError(400, "Invalid pattren ID format");
    }

    // Find and delete pattren
    const pattren = await DefaultPattren.findByIdAndDelete(pattrenId);
    if (!pattren) {
      throw new ApiError(404, "Pattren not found");
    }

    // Delete from Cloudinary using public ID
    try {
      await deleteFromCloudinary(pattren.image.publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError.message);
      // You might want to handle this differently based on requirements
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Pattren deleted successfully"));

  } catch (error) {
    next(error);
  }
});
const allPattren = asyncHandler(async (req, res, next) => {
  const patterns = await DefaultPattren.find();
  try {
    if (!patterns || patterns.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Patterns Found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, patterns, "Fetched Patterns Successfully"));
  } catch (error) {
    next(error);
  }
});

export { addPattren, deletePattren, allPattren };
