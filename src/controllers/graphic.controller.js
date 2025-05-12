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
    let { width, height, offset, isFront } = req.body;
    let graphicLocalPath;

    if (req.file && req.file.path) {
      graphicLocalPath = req.file.path;
    } else {
      throw new ApiError(400, "No file uploaded");
    }

    const uploadedGraphic = await uploadOnCloudinary(graphicLocalPath);

    if (!uploadedGraphic) {
      throw new ApiError(500, "Server Error");
    }

    const owner = req.user._id;

    const graphic = await Graphic.create({
      image: uploadedGraphic.secure_url,
      width,
      height,
      offset,
      isFront,
      owner,
    });

    const createdGraphic = await Graphic.findById(graphic._id);

    if (!createdGraphic) {
      throw new ApiError(500, "Server Error");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdGraphic, "Graphic Added Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

// Delete Graphic
const deleteGraphic = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const graphic = await Graphic.findById(id);
  if (!graphic) {
    throw new ApiError(404, "Graphic not found");
  }

  // Remove from Cloudinary
  const publicId = graphic.image.split("/").pop().split(".")[0];
  await deleteFromCloudinary(publicId);

  // Remove from DB
  await Graphic.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Graphic deleted successfully"));
});

// Search Graphics (by image URL or owner name if populated)
const searchGraphic = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    throw new ApiError(400, "Search query missing");
  }

  const results = await Graphic.find({
    image: { $regex: q, $options: "i" },
  });

  return res.status(200).json(new ApiResponse(200, results, "Search results"));
});

// Get All Graphics by Authenticated User
const allUserGraphics = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;

  const graphics = await Graphic.find({ owner }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, graphics, "User's graphics retrieved"));
});

// Update Graphic (delete old image from Cloudinary)
const updateGraphic = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let { width, height, offset, isFront } = req.body;
  let graphicLocalPath;

  const existing = await Graphic.findById(id);
  if (!existing) {
    throw new ApiError(404, "Graphic not found");
  }

  let newImageUrl = existing.image;

  if (req.file && req.file.path) {
    graphicLocalPath = req.file.path;

    // Upload new image to Cloudinary
    const uploaded = await uploadOnCloudinary(graphicLocalPath);
    if (!uploaded) {
      throw new ApiError(500, "Error uploading new image");
    }

    // Delete old image from Cloudinary
    const oldPublicId = existing.image.split("/").pop().split(".")[0];
    await deleteFromCloudinary(oldPublicId);

    newImageUrl = uploaded.secure_url;
  }

  // Update document
  const updated = await Graphic.findByIdAndUpdate(
    id,
    {
      image: newImageUrl,
      width,
      height,
      offset,
      isFront,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Graphic updated successfully"));
});

export {
  addGraphic,
  deleteGraphic,
  searchGraphic,
  allUserGraphics,
  updateGraphic,
};
