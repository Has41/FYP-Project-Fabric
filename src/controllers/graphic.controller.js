import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Graphic } from "../models/graphic.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";

const addGraphic = asyncHandler(async (req, res, next) => {
  try {
    const { width, height, offset, isFront } = req.body;
    const owner = req.user._id;

    // Validate required fields
    if (!width || !height) {
      throw new ApiError(400, "Width and height are required");
    }

    if (!req.file) { // Now expecting single file upload
      throw new ApiError(400, "No graphic file uploaded");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult?.secure_url || !uploadResult?.public_id) {
      throw new ApiError(500, "Failed to upload graphic to Cloudinary");
    }

    // Parse offset (default to {x:0, y:0} if not provided)
    let offsetObj = { x: 0, y: 0 };
    if (offset) {
      try {
        offsetObj = typeof offset === 'string' ? JSON.parse(offset) : offset;
      } catch (e) {
        throw new ApiError(400, "Invalid offset format");
      }
    }

    // Create graphic document
    const graphic = await Graphic.create({
      owner,
      graphic: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      },
      width: Number(width),
      height: Number(height),
      offset: offsetObj,
      isFront: isFront !== undefined ? isFront : true
    });

    // Cleanup uploaded file
    await fs.promises.unlink(req.file.path).catch(console.error);

    return res
      .status(201)
      .json(new ApiResponse(201, graphic, "Graphic created successfully"));

  } catch (error) {
    // Cleanup file if error occurred
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
});

const deleteGraphic = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const graphic = await Graphic.findById(id);
  if (!graphic) throw new ApiError(404, "Graphic not found");

  try {
    // Delete from Cloudinary
    if (graphic.graphic?.publicId) {
      console.log(`Attempting to delete from Cloudinary: ${graphic.graphic.publicId}`);
      await deleteFromCloudinary(graphic.graphic.publicId);
    }

    // Delete from database
    const deletedGraphic = await Graphic.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, deletedGraphic, "Graphic deleted successfully"));
  } catch (error) {
    // If Cloudinary deletion fails but you still want to delete from DB
    await Graphic.findByIdAndDelete(id);
    throw new ApiError(500, "Graphic database record deleted but Cloudinary deletion failed");
  }
});

const updateGraphic = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { width, height, offset, isFront } = req.body;

    const existing = await Graphic.findById(id);
    if (!existing) throw new ApiError(404, "Graphic not found");

   


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
