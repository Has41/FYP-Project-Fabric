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
  const owner = req.user._id;

  console.log(req.body);


  // Validate required fields
  if (!name) {
    throw new ApiError(400, "Required fields missing");
  }
  if (!mongoose.Types.ObjectId.isValid(owner)) {
    throw new ApiError(400, "Invalid User ID");
  }

  try {
    
    // Validate and upload model file
    let modelFile;
    if (req.file && req.file.path) {
      modelFile = await uploadOnCloudinary(req.file.path);
      if (!modelFile || !modelFile.secure_url) {
        throw new ApiError(500, "Error uploading model file to Cloudinary");
      }
    } else {
      throw new ApiError(400, "No model file uploaded");
    }
    // Create and save the model
    const modelData = {
      name,
      model: modelFile.secure_url,
      owner,
    };
    const model = await Model.create(modelData);

    // Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, model, "Model added successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const deleteModel = asyncHandler(async (req, res, next) => {
  const { modelId } = req.params;

  // Validate modelId   
  if (!mongoose.Types.ObjectId.isValid(modelId)) {
    throw new ApiError(400, "Invalid Model ID");
  }

  try {
    // Find the model by ID
    const model = await Model.findById(modelId);
    if (!model) {
      throw new ApiError(404, "Model not found");
    }

    // Delete the model file from Cloudinary
    const modelUrl = model.model; // Assuming `model` stores the Cloudinary URL
    if (modelUrl) {
      const modelPublicId = modelUrl.split("/").pop().split(".")[0]; // Extract Cloudinary public_id
      await deleteFromCloudinary(modelPublicId); // Implement this function for Cloudinary deletions
    }

    // Delete the model from the database
    await Model.findByIdAndDelete(modelId);

    // Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Model removed successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

export { addModel, deleteModel };