import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Text } from "../models/text.model";
import mongoose from "mongoose";

import { Text } from "../models/text.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Add Text
const addText = asyncHandler(async (req, res, next) => {
  try {
    const { text, fontSize, offset, isFront } = req.body;

    if (!Array.isArray(text) || text.length === 0 || !fontSize) {
      throw new ApiError(400, "Missing or invalid required fields.");
    }

    const newText = await Text.create({
      text, // an array like ["Hello", "World"]
      owner: req.user._id,
      fontSize,
      offset,
      isFront,
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
  const { text, fontSize, offset, isFront } = req.body;

  const updated = await Text.findByIdAndUpdate(
    id,
    {
      ...(text && { text }), // only update if provided
      ...(fontSize && { fontSize }),
      ...(offset && { offset }),
      ...(isFront !== undefined && { isFront }),
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
    const texts = await Text.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, texts, "All texts retrieved."));
  } catch (error) {
    next(error);
  }
});

export { addText, searchByUser, updateText, deleteText, searchById, allText };
