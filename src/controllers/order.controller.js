import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import mongoose from "mongoose";

const addOrder = asyncHandler(async (req, res) => {
  const { products, designs, price, paymentStatus, deliveryStatus } = req.body;

  const orderBy = req.user._id;

  // Validate required fields
  if (!orderBy || !price || !paymentStatus || !deliveryStatus) {
    throw new ApiError(400, "Required fields must be provided");
  }

  // Ensure at least one product or one design is selected
  if (
    (!products || products.length === 0) &&
    (!designs || designs.length === 0)
  ) {
    throw new ApiError(
      400,
      "You must select at least one product or one design."
    );
  }

  // Check if ObjectId for user (orderBy) is valid
  if (!mongoose.Types.ObjectId.isValid(orderBy)) {
    throw new ApiError(400, "Invalid User ID");
  }

  // Validate Product IDs if products are provided
  if (products && products.length > 0) {
    products.forEach((product) => {
      if (!mongoose.Types.ObjectId.isValid(product)) {
        throw new ApiError(400, `Invalid Product ID: ${product}`);
      }
    });
  }

  // Validate Design IDs if designs are provided
  if (designs && designs.length > 0) {
    designs.forEach((design) => {
      if (!mongoose.Types.ObjectId.isValid(design)) {
        throw new ApiError(400, `Invalid Design ID: ${design}`);
      }
    });
  }

  // Create a new order
  const newOrder = new Order({
    orderBy,
    products: products || [], // Defaults to empty array if no products are provided
    designs: designs || [], // Defaults to empty array if no designs are provided
    price,
    paymentStatus,
    deliveryStatus,
  });

  // Save order to the database
  const savedOrder = await newOrder.save();

  // Return the saved order in the response
  return res
    .status(201)
    .json(new ApiResponse(201, savedOrder, "Order created successfully"));
});

export { addOrder };
