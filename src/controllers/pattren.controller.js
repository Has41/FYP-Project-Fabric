import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
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
    if (req.file && req.file.path) {
      pattrenLocalPath = req.file.path;
      console.log("pattrenImage local path:", pattrenLocalPath);
    } else {
      console.log("No file uploaded or incorrect file structure:", req.file);
    }

    const pattrenImage = await uploadOnCloudinary(pattrenLocalPath);
    const owner = req.user._id;
    console.log(pattrenImage.secure_url);

    const pattren = await Pattren.create({
      owner,
      
      name: name || null,
      image: pattrenImage.secure_url,
    });

    const createdPattren = await Pattren.findById(pattren._id);

    if (!createdPattren) {
      throw new ApiError(500, "Server Error");
    }

    // Return the response with user data
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

const allPattren = asyncHandler(async (req, res, next) => {
  const patterns = await Pattren.find();
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

/******  30e5f2fc-ea0b-4487-aa48-854d5bef4772  *******/
export { addPattren, deletePattren, allPattren };
