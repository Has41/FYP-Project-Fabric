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
    const { text, category, fontSize, offset, isFront } = req.body;

    if (!text || !category || !fontSize) {
      throw new ApiError(400, "Missing required fields.");
    }

    const newText = await Text.create({
      text,
      category,
      fontSize,
      offset,
      isFront,
    });

    return res.status(201).json(new ApiResponse(201, newText, "Text added successfully."));
  } catch (error) {
    next(error);
  }
});

// Update Text
const updateText = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedText = await Text.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedText) {
      throw new ApiError(404, "Text not found.");
    }

    return res.status(200).json(new ApiResponse(200, updatedText, "Text updated successfully."));
  } catch (error) {
    next(error);
  }
});

// Delete Text
const deleteText = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Text.findByIdAndDelete(id);

    if (!deleted) {
      throw new ApiError(404, "Text not found.");
    }

    return res.status(200).json(new ApiResponse(200, deleted, "Text deleted successfully."));
  } catch (error) {
    next(error);
  }
});

// Search Text by query
const searchText = asyncHandler(async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      throw new ApiError(400, "Search query not provided.");
    }

    const results = await Text.find({
      text: { $regex: q, $options: "i" },
    });

    return res.status(200).json(new ApiResponse(200, results, "Search results."));
  } catch (error) {
    next(error);
  }
});

// Get All Texts
const allText = asyncHandler(async (req, res, next) => {
  try {
    const texts = await Text.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, texts, "All texts retrieved."));
  } catch (error) {
    next(error);
  }
});


export { addText, updateText, deleteText, searchText, allText };