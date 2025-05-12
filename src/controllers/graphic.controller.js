import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Graphic } from "../models/graphic.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const addGraphic = asyncHandler(async (req, res, next) => {
  try {
    const { width, height, offset, isFront } = req.body;
    const owner = req.user._id;

    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No graphics uploaded.");
    }

    const uploadedGraphics = [];

    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);
      if (!result?.secure_url || !result?.public_id) {
        throw new ApiError(500, "Graphic upload failed");
      }
      uploadedGraphics.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    const graphic = await Graphic.create({
      owner,
      graphic: uploadedGraphics,
      width,
      height,
      offset,
      isFront,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, graphic, "Graphic created successfully"));
  } catch (error) {
    next(error);
  }
});

const deleteGraphic = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const graphic = await Graphic.findById(id);
  if (!graphic) throw new ApiError(404, "Graphic not found");

  // Delete all graphics from Cloudinary using public IDs
  for (const image of graphic.graphic) {
    await deleteFromCloudinary(image.publicId);
  }

  await graphic.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Graphic deleted successfully"));
});

const updateGraphic = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { width, height, offset, isFront } = req.body;

    const existing = await Graphic.findById(id);
    if (!existing) throw new ApiError(404, "Graphic not found");

    // Delete previous graphics from Cloudinary using public IDs
    for (const image of existing.graphic) {
      await deleteFromCloudinary(image.publicId);
    }

    const newGraphics = [];
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);
      if (!result?.secure_url || !result?.public_id) {
        throw new ApiError(500, "Failed to upload new graphic");
      }
      newGraphics.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    existing.graphic = newGraphics;
    existing.width = width;
    existing.height = height;
    existing.offset = offset;
    existing.isFront = isFront;

    await existing.save();

    return res
      .status(200)
      .json(new ApiResponse(200, existing, "Graphic updated successfully"));
  } catch (error) {
    next(error);
  }
});

const getGraphicById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const graphic = await Graphic.findById(id);
  if (!graphic) throw new ApiError(404, "Graphic not found");

  return res
    .status(200)
    .json(new ApiResponse(200, graphic, "Graphic retrieved successfully"));
});

// Get All Graphics by Authenticated User
const getUserGraphics = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;
  const graphics = await Graphic.find({ owner });

  return res
    .status(200)
    .json(new ApiResponse(200, graphics, "User's graphics retrieved"));
});

export {
  addGraphic,
  deleteGraphic,
  getGraphicById,
  getUserGraphics,
  updateGraphic,
};
