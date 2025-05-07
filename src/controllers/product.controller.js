import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

const addProduct = asyncHandler(async (req, res, next) => {
  const { title, description, price, discount_price, quantity, category, model, type } =
    req.body;
  const owner = req.user._id;

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized");
  }
  

  // Validate required fields
  if (!title || !description || !price || !quantity || !category || !model || !type) {
    throw new ApiError(400, "Required fields missing");
  }
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid Category ID");
  }
  if(!mongoose.Types.ObjectId.isValid(model)){
    throw new ApiError(400, "Invalid Model ID");
  }

  try {
    // Validate and upload model file
    
    // Create and save the product
    const product = new Product({
      title,
      description,
      price,
      discount_price: discount_price || null,
      quantity,
      owner,
      category,
      model, 
      type,
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

    if (!product.owner.equals(req.user._id) && req.user.role !== "admin") {
      throw new ApiError(403, "Unauthorized");
    }
    
    // Delete the model file from Cloudinary
   

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
  const { title, description, price, discount_price, quantity, category, model } =
    req.body;
  const { productId } = req.params;

  if (!title || !description || !price || !quantity || !category || !model) {
    throw new ApiError(400, "Required fields missing");
  }
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid Category ID");
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Category ID");
  }
  if(!mongoose.Types.ObjectId.isValid(model)){
    throw new ApiError(400, "Invalid Model ID");
  }

  if ( req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized");
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
        model,
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
      $match: { _id: new mongoose.Types.ObjectId(productId) }, // Match product by ID
    },
    {
      $lookup: {
        from: "categories", // Lookup category collection
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category", // Unwind the category array to make it an object
    },
    {
      $lookup: {
        from: "models",       // Lookup model collection
        localField: "model",  
        foreignField: "_id",    
        as: "model",           
      },
    },
    {
      $unwind: "$model", // Unwind the model array to make it an object (optional if you expect only one result)
    },
    {
      $project: {  // Project the fields you want to return, including name and model
        _id: 1,
        name: 1,
        description: 1,
        price: 1,
        "category.name": 1,
        "category._id": 1,
        "model.name": 1,  // Include model name
        "model.model": 1, // Include model field
      },
    },
  ]);

  if (!product || product.length === 0) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(new ApiResponse(200, product[0], "Product Found"));
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
    {
      $lookup: {
        from: "models", // Join with the 'models' collection (adjust collection name as necessary)
        localField: "model", // Assuming 'model' is the field storing the reference to the 'models' collection
        foreignField: "_id", // Foreign key is typically _id in the 'models' collection
        as: "model", // The result will be stored in the 'model' field
      },
    },
    {
      $unwind: "$model", // Flatten the 'model' array (assuming it's a single model, this makes it an object)
    },
    {
      $project: { // Optionally, you can specify the fields you want to return
        _id: 1,
        title: 1,          // Product name
        price: 1,         // Product price
        description: 1,   // Product description
        "category.name": 1, // Category name
        "category._id": 1, // Category id
        "model.name": 1,   // Model name
        "model.model": 1,  // Model field (assuming this is what you want)
      },
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
  searchProduct,
  allProducts,
};
