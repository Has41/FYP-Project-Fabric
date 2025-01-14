import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

const addProduct = asyncHandler(async (req, res, next) => {
  const { title, description, price, discount_price, quantity, category } =
    req.body;
  const owner = req.user._id;

  // Validate required fields
  if (!title || !description || !price || !quantity || !category) {
    throw new ApiError(400, "Required fields missing");
  }
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid Category ID");
  }

  try {
    // Validate and upload model file
    let model;
    if (req.file && req.file.path) {
      model = await uploadOnCloudinary(req.file.path);
      if (!model || !model.secure_url) {
        throw new ApiError(500, "Error uploading model file to Cloudinary");
      }
    } else {
      throw new ApiError(400, "No model file uploaded");
    }

    // Create and save the product
    const product = new Product({
      title,
      description,
      price,
      discount_price: discount_price || null,
      quantity,
      owner,
      category,
      model: model.secure_url, // Use Cloudinary's secure URL
    });

    const savedProduct = await product.save();

    // Return success response
    return res
      .status(201)
      .json(new ApiResponse(201, savedProduct, "Product added successfully."));
  } catch (error) {
    next(error);
  }
});

const removeProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Delete the model file from Cloudinary
    const modelUrl = product.model; // Assuming `model` stores the Cloudinary URL
    if (modelUrl) {
      const modelPublicId = modelUrl.split("/").pop().split(".")[0]; // Extract Cloudinary public_id
      await deleteFromCloudinary(modelPublicId); // Implement this function for Cloudinary deletions
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    // Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Product removed successfully"));
  } catch (error) {
    next(error);
  }
});

const updateProductInfo = asyncHandler(async (req, res) => {
  const { title, description, price, discount_price, quantity, category } =
    req.body;
  const { productId } = req.params;

  if (!title || !description || !price || !quantity || !category) {
    throw new ApiError(400, "Required fields missing");
  }
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid Category ID");
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Category ID");
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        title,
        description,
        price,
        discount_price: discount_price || null,
        quantity,
        category,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedProduct) {
    throw new ApiError(501, "Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "ProductUpdated"));
});

const updateProductModel = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check if a new file is provided
    if (!req.file || !req.file.path) {
      throw new ApiError(400, "No file uploaded");
    }

    // Delete the old model file from Cloudinary
    if (product.model) {
      const oldModelPublicId = product.model.split("/").pop().split(".")[0]; // Extract Cloudinary public_id
      await deleteFromCloudinary(oldModelPublicId); // Implemented in the previous example
    }

    // Upload the new model file to Cloudinary
    const newModel = await uploadOnCloudinary(req.file.path);
    if (!newModel || !newModel.secure_url) {
      throw new ApiError(500, "Error uploading new model to Cloudinary");
    }

    // Update the product's model field
    product.model = newModel.secure_url;
    const updatedProduct = await product.save();

    // Return success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProduct,
          "Product model updated successfully"
        )
      );
  } catch (error) {
    next(error);
  }
});

const searchProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Extract productId from route parameters

  if (!productId || !productId.trim()) {
    throw new ApiError(404, "Product Id not found in parameters");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  const product = await Product.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(productId) }, // Use 'new' here
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category", // Optionally flatten the category array
    },
  ]);

  if (!product || product.length === 0) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product[0], "Product Found"));
});




const allProducts = asyncHandler(async (req, res) => {
  const aggregateQuery = Product.aggregate([
    {
      $lookup: {
        from: "categories", // Join with the 'categories' collection
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category", // Flatten the category array if needed
    },
  ]);

  // Execute the aggregate query directly
  const products = await aggregateQuery.exec();

  if (!products || products.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No products found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products Fetched Successfully"));
});


export {
  addProduct,
  removeProduct,
  updateProductInfo,
  updateProductModel,
  searchProduct,
  allProducts,
};
