import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Pattern } from "../models/pattern.model.js";
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
    if (!uploadResult?.secure_url || !uploadResult?.public_id) {
      throw new ApiError(500, "Failed to upload pattern to Cloudinary");
    }

    // Create pattern document
    const pattern = await Pattern.create({
      owner: req.user._id,
      name: name.trim(),
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, pattern, "pattern added successfully"));
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
    const pattern = await Pattern.findByIdAndDelete(patternId);
    if (!pattern) {
      throw new ApiError(404, "pattern not found");
    }

    // Delete from Cloudinary using public ID
    try {
      await deleteFromCloudinary(pattern.image.publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError.message);
      // Consider whether to proceed or throw error based on your requirements
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "pattern deleted successfully"));
  } catch (error) {
    next(error);
  }
});
const allPatterns = asyncHandler(async (req, res, next) => {
  try {
    // Fetch patterns owned by the current user
    const patterns = await Pattern.find({ owner: req.user._id });

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

const getPatternById = asyncHandler(async (req, res, next) => {
  try {
    const { patternId } = req.params;
    if (!patternId) {
      throw new ApiError(400, "Pattern Id Not Found");
    }
    const pattern = await Pattern.findById(patternId);
    if (!pattern) {
      throw new ApiError(404, "Pattern Not Found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, pattern, "Pattern Fetched Successfully"));
  } catch (error) {
    next(error);
  }
});

const getAllPatterns = asyncHandler(async (req, res, next) => {
  try {
    const patterns = await Pattern.find();
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

export {
  addPattern,
  deletePattern,
  allPatterns,
  getPatternById,
  getAllPatterns,
};
