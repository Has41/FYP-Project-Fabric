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
    let { name } = req.body;
    let pattrenLocalPath;

    // Ensure that a file is uploaded and that it's an SVG
    if (req.file && req.file.path) {
      const fileMimeType = req.file.mimetype;

      // Check if the uploaded file is an SVG
      if (fileMimeType !== 'image/svg+xml') {
        return res.status(400).json(new ApiResponse(400, null, "Only SVG files are allowed"));
      }

      pattrenLocalPath = req.file.path;
    } else {
      console.error("No file uploaded or incorrect file structure:", req.file);
      return res.status(400).json(new ApiResponse(400, null, "Only svg allowed"));
    }

    // Upload the SVG image to Cloudinary
    const pattrenImage = await uploadOnCloudinary(pattrenLocalPath);

    // Check if the upload was successful
    if (!pattrenImage) {
      return res.status(500).json(new ApiResponse(500, null, "Error uploading image to Cloudinary"));
    }

    const owner = req.user._id; // Assuming the user is authenticated and their ID is stored in `req.user._id`

    // Create the pattern in the database with the image URL from Cloudinary
    const pattren = await Pattren.create({
      owner,
      name: name || null,
      image: pattrenImage.secure_url, // Use the Cloudinary URL of the uploaded image
    });

    const createdPattren = await Pattren.findById(pattren._id);

    if (!createdPattren) {
      throw new ApiError(500, "Server Error");
    }

    // Return success response with the created pattern
    return res
      .status(200)
      .json(new ApiResponse(200, createdPattren, "Pattren Added Successfully"));
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
    const pattren = await Pattren.findById(pattrenId);
    if (!pattren) {
      throw new ApiError(404, "Pattren Not Found");
    }
    await deleteFromCloudinary(pattren.image);
    await Pattren.findByIdAndDelete(pattrenId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Pattren Deleted Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
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

/******  30e5f2fc-ea0b-4487-aa48-854d5bef4772  *******/
export { addPattren, deletePattren, allPatterns };
