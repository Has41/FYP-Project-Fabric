import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { ReturnOrder } from "../models/returnOrder.model.js";
import mongoose from "mongoose";

const addOrder = asyncHandler(async (req, res) => {
  const {  designs, price, paymentStatus, deliveryStatus } = req.body;

  const orderBy = req.user._id;

  // Validate required fields
  if (!orderBy || !price || !paymentStatus || !deliveryStatus) {
    throw new ApiError(400, "Required fields must be provided");
  }

  // Ensure at least one  or one design is selected
  if (
    (!designs || designs.length === 0)
  ) {
    throw new ApiError(
      400,
      "You must select at least  one design."
    );
  }

  // Check if ObjectId for user (orderBy) is valid
  if (!mongoose.Types.ObjectId.isValid(orderBy)) {
    throw new ApiError(400, "Invalid User ID");
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
    designs: designs ,
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

const deleteOrder = asyncHandler(async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      throw new ApiError(404, "Order ID Not Found");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order Not Found");
    }

    // Check if the order is older than 2 days
    const currentDate = new Date();
    const orderDate = new Date(order.createdAt);
    const differenceInTime = currentDate - orderDate;
    const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert time difference to days

    if (differenceInDays > 2) {
      throw new ApiError(
        400,
        "Order is older than 2 days and cannot be deleted."
      );
    }

    // Check if the deliveryStatus is not "pending"
    if (order.deliveryStatus !== "pending") {
      throw new ApiError(
        400,
        "Order cannot be deleted as the delivery status is not 'pending'."
      );
    }

    // If both conditions are satisfied, proceed with deletion
    await Order.findByIdAndDelete(orderId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Order Deleted Successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("orderBy", "name email")
    .populate("designs");

  res.status(200).json(new ApiResponse(200, orders, "All orders fetched."));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate("orderBy", "name email")
    .populate("designs");

  if (!order) throw new ApiError(404, "Order not found");

  res.status(200).json(new ApiResponse(200, order, "Order fetched."));
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { deliveryStatus } = req.body;

  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (deliveryStatus) {
    order.deliveryStatus = deliveryStatus;
  }
  order.deliveredDate = new Date();
  await order.save();

  res.status(200).json(new ApiResponse(200, order, "Delivery status updated."));
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  res.status(200).json(new ApiResponse(200, order, "Payment status updated."));
});

const returnedOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body; // Assuming the reason is passed in the request body

  // Find the order by ID
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if the order's delivery status is "delivered"
  if (order.deliveryStatus !== "delivered") {
    throw new ApiError(400, "Order is not delivered yet");
  }

  // Calculate the difference in days between the delivered date and the current date
  const deliveredDate = new Date(order.deliveredDate);
  const currentDate = new Date();
  const timeDifference = currentDate - deliveredDate;
  const daysDifference = timeDifference / (1000 * 3600 * 24); // Convert milliseconds to days

  // Check if the order is not older than 3 days
  if (daysDifference > 3) {
    throw new ApiError(
      400,
      "Order cannot be returned. It is older than 3 days."
    );
  }

  // Create a new return record in the "returns" collection
  const returnData = new ReturnOrder({
    order: order._id,
    returnDate: currentDate,
    reason,
    status: "requested", // Initial status is "requested"
  });

  // Save the return record to the database
  await returnData.save();

  // Optionally, you can update the `order` to reflect that it's in a return process
  // For example, you might add a "returnRequested" field or similar.
  // order.returnStatus = "requested"; // If you want to track this in the order schema
  // await order.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, returnData, "Return request created successfully.")
    );
});

const approveReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params; // Get the return request ID
  const { approvalStatus } = req.body; // The approval status from the request body (approved or rejected)
  const validStatuses = ["approved", "rejected"]; // Define valid statuses for return approval

  // Check if the provided status is valid
  if (!validStatuses.includes(approvalStatus)) {
    throw new ApiError(
      400,
      "Invalid approval status. It must be 'approved' or 'rejected'."
    );
  }

  // Find the return request by ID
  const returnRequest = await ReturnOrder.findById(returnId);
  if (!returnRequest) {
    throw new ApiError(404, "Return request not found.");
  }

  // Find the associated order to update
  const order = await Order.findById(returnRequest.order);
  if (!order) {
    throw new ApiError(
      404,
      "Order associated with this return request not found."
    );
  }

  // Update the return request status
  returnRequest.status = approvalStatus;
  await returnRequest.save();

  // If the return is approved, update the order's delivery status or any other field as needed
  if (approvalStatus === "approved") {
    order.returned = true; // Mark the order as returned
    order.deliveryStatus = "returned"; // Change delivery status to returned (optional)
    await order.save();
  }

  // Respond with the updated return request and order
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { returnRequest, order },
        "Return request processed successfully."
      )
    );
});

export {
  addOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateDeliveryStatus,
  updatePaymentStatus,
  returnedOrder,
  approveReturn,
};
