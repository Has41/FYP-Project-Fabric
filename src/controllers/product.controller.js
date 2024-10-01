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
  const owner = req.user_.id;

  if (!title || !description || !price || !quantity || !category) {
    throw new ApiError(400, "Required fields missing");
  }
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid Category ID");
  }

  if (!req.files || req.files.length < 4) {
    throw new ApiError(400, "You must upload at least 4 images.");
  }

  try {
    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await uploadOnCloudinary(file.path);
        return uploadResult.secure_url; // Save the Cloudinary URL
      })
    );

    const product = new Product({
      title,
      description,
      price,
      discount_price: discount_price || null,
      quantity,
      owner,
      category,
      images: imageUrls,
    });

    const savedProduct = await product.save();

    return res
      .status(201)
      .json(new ApiResponse(201, savedProduct, "Product added successfully."));
  } catch (error) {
    next(error);
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId.trim()) {
    throw new ApiError(404, "Product Id not Found in Params");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product Not Found");
  }

  // Delete images from Cloudinary
  try {
    // Assuming the product.images is an array of URLs
    const deleteImagePromises = product.images.map(async (imageUrl) => {
      // Extract the public_id from the image URL (Cloudinary URLs contain the public_id before the extension)
      const publicId = extractPublicId(imageUrl); // Create a helper function for this
      await deleteFromCloudinary(publicId);
    });

    // Wait for all images to be deleted
    await Promise.all(deleteImagePromises);
  } catch (error) {
    throw new ApiError(500, "Error deleting images from Cloudinary");
  }

  // Delete the product from the database
  const deletedProduct = await Product.findByIdAndDelete(productId);

  if (!deletedProduct) {
    throw new ApiError(400, "Product Deletion Failed");
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, deletedProduct, "Product Deleted Successfully"));
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

const updateProductPics = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId.trim()) {
    throw new ApiError(404, "Product Id not Found in Params");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  if (!req.files || req.files.length < 4) {
    throw new ApiError(400, "You must upload at least 4 images.");
  }

  try {
    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await uploadOnCloudinary(file.path);
        return uploadResult.secure_url; // Save the Cloudinary URL
      })
    );
  } catch (error) {
    throw new ApiError(500, "Error Uploading images from Cloudinary");
  }

  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product Not Found");
  }

  // Delete images from Cloudinary
  try {
    // Assuming the product.images is an array of URLs
    const deleteImagePromises = product.images.map(async (imageUrl) => {
      // Extract the public_id from the image URL (Cloudinary URLs contain the public_id before the extension)
      const publicId = extractPublicId(imageUrl); // Create a helper function for this
      await deleteFromCloudinary(publicId);
    });

    // Wait for all images to be deleted
    await Promise.all(deleteImagePromises);
  } catch (error) {
    throw new ApiError(500, "Error deleting images from Cloudinary");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: { images: imageUrls } },
    { new: true }
  );
  if (!updatedProduct) {
    throw new ApiError(501, "Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "ProductUpdated"));
});

const searchProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId.trim()) {
    throw new ApiError(404, "Product Id not Found in Body");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  const product = await Product.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(productId) } // Match by productId
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
      $unwind: "$category" // Optionally flatten the category array
    }
  ]);

  if (!product || product.length === 0) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product[0], "Product Found"));
});

const allProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Set default pagination values

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

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

  // Use aggregatePaginate to paginate the results
  const products = await Product.aggregatePaginate(aggregateQuery, options);

  if (!products.docs || products.docs.length === 0) {
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
  updateProductPics,
  searchProduct,
  allProducts
};
