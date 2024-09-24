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
    const { title, description, price, discount_price, quantity, category } = req.body;
    const owner = req.user_.id;
    
    if (!title || !description || !price || !quantity || !category) {
      throw new ApiError(400, "Required fields missing");
    }
  
    // Ensure that at least 4 images are uploaded
    if (!req.files || req.files.length < 4) {
      throw new ApiError(400, "You must upload at least 4 images.");
    }
  
    try {
      // Upload images to Cloudinary
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await uploadOnCloudinary(file.path);
          return uploadResult.secure_url;  // Save the Cloudinary URL
        })
      );
  
      // Create the product with image URLs
      const product = new Product({
        title,
        description,
        price,
        discount_price: discount_price || '',
        quantity,
        owner,
        category,
        images: imageUrls,  // Store the uploaded image URLs in the images array
      });
  
      const savedProduct = await product.save();
  
      return res
        .status(201)
        .json(new ApiResponse(201, savedProduct, "Product added successfully."));
    } catch (error) {
      next(error);
    }
  });
  

export {addProduct};
