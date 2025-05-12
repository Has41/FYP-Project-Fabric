import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Pattren } from "../models/pattren.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addPattren = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name?.trim()) {
      throw new ApiError(400, "pattren name is required");
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
      throw new ApiError(500, "Failed to upload pattren to Cloudinary");
    }

    // Create pattren document
    const pattren = await Pattren.create({
      owner: req.user._id,
      name: name.trim(),
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, pattren, "pattren added successfully"));
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
    const pattren = await Pattren.findByIdAndDelete(pattrenId);
    if (!pattren) {
      throw new ApiError(404, "pattren not found");
    }

    // Delete from Cloudinary using public ID
    try {
      await deleteFromCloudinary(pattren.image.publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError.message);
      // Consider whether to proceed or throw error based on your requirements
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "pattren deleted successfully"));
  } catch (error) {
    next(error);
  }
});
const allPatterns = asyncHandler(async (req, res, next) => {
  try {
    // Fetch patterns owned by the current user
    const patterns = await Pattren.find({ owner: req.user._id });

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

const getPattrenById = asyncHandler(async (req, res, next) => {
  try {
    const { pattrenId } = req.params;
    if (!pattrenId) {
      throw new ApiError(400, "Pattren Id Not Found");
    }
    const pattren = await Pattren.findById(pattrenId);
    if (!pattren) {
      throw new ApiError(404, "Pattren Not Found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, pattren, "Pattren Fetched Successfully"));
  } catch (error) {
    next(error);
  }
});

const getAllPatterns = asyncHandler(async (req, res, next) => {
  try {
    const patterns = await Pattren.find();
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
  addPattren,
  deletePattren,
  allPatterns,
  getPattrenById,
  getAllPatterns,
};
