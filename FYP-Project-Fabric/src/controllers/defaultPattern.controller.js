import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { DefaultPattern } from "../models/defaultPattern.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const addPattern = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name?.trim()) {
      throw new ApiError(400, "pattern name is required");
    }

    // Check file upload
    if (!req.file?.path) {
      throw new ApiError(400, "SVG file is required");
    }

    // Validate file type
    if (req.file.mimetype !== "image/svg+xml") {
      throw new ApiError(400, "Only SVG files are allowed");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.path);

    // Create pattern
    const pattern = await DefaultPattern.create({
      name,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, pattern, "Pattern added successfully"));
  } catch (error) {
    next(error);
  }
});

const deletePattern = asyncHandler(async (req, res, next) => {
  try {
    const { patternId } = req.params;

    // Validate pattern ID
    if (!mongoose.Types.ObjectId.isValid(patternId)) {
      throw new ApiError(400, "Invalid pattern ID format");
    }

    // Find and delete pattern
    const pattern = await DefaultPattern.findByIdAndDelete(patternId);
    if (!pattern) {
      throw new ApiError(404, "Pattern not found");
    }

    // Delete from Cloudinary using public ID
    try {
      await deleteFromCloudinary(pattern.image.publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError.message);
      // You might want to handle this differently based on requirements
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Pattern deleted successfully"));

  } catch (error) {
    next(error);
  }
});

const allPattern = asyncHandler(async (req, res, next) => {
  try {
    const patterns = await DefaultPattern.find();
    
    if (!patterns?.length) {
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

export { addPattern, deletePattern, allPattern };
