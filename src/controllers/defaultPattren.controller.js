import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { DefaultPattren } from "../models/defaultPattren.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addPattren = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;
    //const owner = req.user._id;

    let files = [];

    // Handle single file or multiple files
    if (req.file) {
      files = [req.file]; // Single file case
    } else if (req.files && Array.isArray(req.files)) {
      files = req.files; // Multiple files case
    } else {
      throw new ApiError(400, "No file uploaded");
    }

    const createdPatterns = [];

    // Process each file
    for (const file of files) {
      const pattrenLocalPath = file.path;

      // Upload to Cloudinary
      const pattrenImage = await uploadOnCloudinary(pattrenLocalPath);

      // Save to the database
      const pattren = await DefaultPattren.create({
       
        name: name || null,
        image: pattrenImage.secure_url,
      });

      createdPatterns.push(pattren);
    }

    // Return the response with all created patterns
    return res
      .status(200)
      .json(new ApiResponse(200, createdPatterns, "Patterns Added Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});



const deletePattren = asyncHandler(async (req, res, next) => {
  try {
    const { pattrenId } = req.params;
    if (!pattrenId) {
      throw new ApiError(400, "Pattren Id Not Found");
    }
    const pattren = await DefaultPattren.findById(pattrenId);
    if (!pattren) {
      throw new ApiError(404, "Pattren Not Found");
    }
    await deleteFromCloudinary(pattren.image);
    await DefaultPattren.findByIdAndDelete(pattrenId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Pattren Deleted Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const allPattren = asyncHandler(async (req, res, next) => {
  const patterns = await DefaultPattren.find();
  try {
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

export { addPattren, deletePattren, allPattren };
