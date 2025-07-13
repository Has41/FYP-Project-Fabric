import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Text } from "../models/text.model.js";
import mongoose from "mongoose";

// Add Text
const addText = asyncHandler(async (req, res, next) => {
  try {
    const { text, fontSize, offset, isFront, color } = req.body;

    if (!text || typeof text !== "string" || !fontSize) {
      throw new ApiError(400, "Missing or invalid required fields.");
    }

    const newText = await Text.create({
      text,
      owner: req.user._id,
      fontSize,
      offset,
      isFront,
      color,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newText, "Text added successfully."));
  } catch (error) {
    next(error);
  }
});

const searchByUser = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;

  const texts = await Text.find({ owner });

  return res
    .status(200)
    .json(new ApiResponse(200, texts, "User's texts retrieved."));
});

// Update Text
const updateText = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { text, fontSize, offset, isFront, color } = req.body;

  const updated = await Text.findByIdAndUpdate(
    id,
    {
      ...(text && { text }), // only update if provided
      ...(fontSize && { fontSize }),
      ...(offset && { offset }),
      ...(isFront !== undefined && { isFront }),
      ...(color && { color }),
    },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(404, "Text not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Text updated successfully."));
});

// Delete Text
const deleteText = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await Text.findByIdAndDelete(id);

  if (!deleted) {
    throw new ApiError(404, "Text not found or already deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Text deleted successfully."));
});

// Search Text by query
const searchById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const text = await Text.findById(id);

  if (!text) {
    throw new ApiError(404, "Text not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, text, "Text retrieved successfully."));
});

// Get All Texts
const allText = asyncHandler(async (req, res, next) => {
  try {
    // Optionally add filters based on owner/other criteria
    const filter = {};

    // If you want only the current user's texts
    // filter.owner = req.user._id;

    const texts = await Text.find(filter).sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, texts, "All texts retrieved successfully."));
  } catch (error) {
    next(error);
  }
});

const getUserTexts = asyncHandler(async (req, res, next) => {
  try {
    // Get texts belonging to the authenticated user
    const texts = await Text.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    if (!texts || texts.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No texts found for this user."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, texts, "User texts retrieved successfully."));
  } catch (error) {
    next(error);
  }
});

export {
  addText,
  searchByUser,
  updateText,
  deleteText,
  searchById,
  allText,
  getUserTexts,
};
