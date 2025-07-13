import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import mongoose from "mongoose";

const addCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, "Name Not Found");
    }

    const findCategory = await Category.findOne({ name: name });
    if (findCategory) {
      throw new ApiError(500, "Category Already Exist");
    }
    const category = await Category.create({
      name,
    });

    const createdCategory = await Category.findById(category._id);

    if (!createdCategory) {
      throw new ApiError(500, "Server Error");
    }

    // Return the response with user data
    return res
      .status(201)
      .json(
        new ApiResponse(201, createdCategory, "Category Created successfully.")
      );
  } catch (error) {
    next(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  if (!categoryId) {
    throw new ApiError(400, "Category Id Not Found");
  }
  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    throw new ApiError(400, "Category Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedCategory, "Delete Successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  if (!categoryId) {
    throw new ApiError(400, "Category Id Not Found");
  }
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Name Not Found");
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: { name: name } },
    { new: true }
  );

  if (!updatedCategory) {
    throw new ApiError(400, "Category Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, "Updated  Successfully"));
});

const categoryById = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;

  if (!categoryId) {
    throw new ApiError(400, "Category ID Not Found");
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid Category ID");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(400, "Category Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Fatched Successfully"));
});

const allCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find(); // Fetch all categories

  if (!categories || categories.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No Categories Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Fetched Categories Successfully"));
});

export {
  addCategory,
  deleteCategory,
  updateCategory,
  categoryById,
  allCategories,
};
