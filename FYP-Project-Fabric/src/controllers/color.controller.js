import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Color } from "../models/color.model.js";

const addColor = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, "Name Not Found");
    }

    const findColor = await Color.findOne({ name: name });
    if (findColor) {
      throw new ApiError(500, "Color Already Exist");
    }
    const color = await Color.create({
      name,
    });

    const createdColor = await Color.findById(color._id);

    if (!createdColor) {
      throw new ApiError(500, "Server Error");
    }

    // Return the response with user data
    return res
      .status(200)
      .json(new ApiResponse(200, "Color Added Successfully", createdColor));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const allColors = asyncHandler(async (req, res, next) => {
  const colors = await Color.find();
  try {
    if (!colors || colors.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Colors Found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Colors Found Successfully", colors));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const deleteColor = asyncHandler(async (req, res, next) => {
  try {
    const { colorId } = req.params;
    if (!colorId) {
      throw new ApiError(400, "Color Id Not Found");
    }
    const color = await Color.findById(colorId);
    if (!color) {
      throw new ApiError(404, "Color Not Found");
    }
    await Color.findByIdAndDelete(colorId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Color Deleted Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const updateColor = asyncHandler(async (req, res, next) => {
  try {
    const { colorId } = req.params;
    if (!colorId) {
      throw new ApiError(400, "Color Id Not Found");
    }
    const color = await Color.findById(colorId);
    if (!color) {
      throw new ApiError(404, "Color Not Found");
    }
    const { name } = req.body;
    if (!name) {
      throw new ApiError(400, "Name Not Found");
    }
    const findColor = await Color.findOne({ name: name });
    if (findColor) {
      throw new ApiError(500, "Color Already Exist");
    }
    const updatedColor = await Color.findByIdAndUpdate(
      colorId,
      { $set: { name: name } },
      { new: true }
    );
    if (!updatedColor) {
      throw new ApiError(400, "Color Not Found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, updatedColor, "Updated  Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const getColor = asyncHandler(async (req, res, next) => {
  try {
    const { colorId } = req.params;
    if (!colorId) {
      throw new ApiError(400, "Color Id Not Found");
    }
    const color = await Color.findById(colorId);
    if (!color) {
      throw new ApiError(404, "Color Not Found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, color, "Color Found Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

export { addColor, allColors, deleteColor, updateColor, getColor };
