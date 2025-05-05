import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Model } from "../models/models.model.js";
import mongoose from "mongoose";


const addModel = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const owner = req.user._id; // Use req.user._id instead of user._id

  
  // Validation
  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (!mongoose.Types.ObjectId.isValid(owner)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!req.file) {
    throw new ApiError(400, "Model file is required");
  }

  try {
   

    // Upload to Cloudinary
    const modelFile = await uploadOnCloudinary(req.file.path);
    if (!modelFile?.secure_url) {
      throw new ApiError(500, "Failed to upload model to Cloudinary");
    }

    // Create model record - using the correct variables
    const model = await Model.create({
      owner, // Using req.user._id
      name,  // Using name from req.body
      model: modelFile.secure_url,
      public_id: modelFile.public_id
    });

    return res
      .status(201)
      .json(new ApiResponse(201, model, "Model added successfully"));

  } catch (error) {
    console.error("Error in addModel:", error);
    next(error);
  }
});

const deleteModel = asyncHandler(async (req, res, next) => {
  const { modelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(modelId)) {
    throw new ApiError(400, "Invalid model ID");
  }

  try {
    const model = await Model.findById(modelId);
    if (!model) {
      throw new ApiError(404, "Model not found");
    }

    // Delete from Cloudinary first
    await deleteFromCloudinary(model.model.public_id);

    // Then delete from database
    await Model.findByIdAndDelete(modelId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Model deleted successfully"));
  } catch (error) {
    console.error("Error in deleteModel:", error);
    next(error);
  }
});

const getAllModels = asyncHandler(async (req, res, next) => {
  try {
    const models = await Model.find();
    return res.status(200).json(new ApiResponse(200, models, "Models fetched successfully"));
  } catch (error) {
    console.error("Error in getAllModels:", error);
    next(error);
  }
});

const getModelsByUser = asyncHandler(async (req, res, next) => {
  try {
    const models = await Model.find({ owner: req.user._id });
    return res.status(200).json(new ApiResponse(200, models, "Models fetched successfully"));
  } catch (error) {
    console.error("Error in getModelsByUser:", error);
    next(error);
  }
});

const getModelById = asyncHandler(async (req, res, next) => {
  const { modelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(modelId)) {
    throw new ApiError(400, "Invalid model ID");
  }

  try {
    const model = await Model.findById(modelId);
    if (!model) {
      throw new ApiError(404, "Model not found");
    }
    return res.status(200).json(new ApiResponse(200, model, "Model fetched successfully"));
  } catch (error) {
    console.error("Error in getModelById:", error);
    next(error);
  }
});

export { addModel, deleteModel, getAllModels, getModelsByUser, getModelById };