import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Design } from "../models/design.model.js";
import mongoose from "mongoose";

const validateDesignForPurchase = (design, userId) => {
  if (!design.isPublic && design.owner.toString() !== userId) {
    throw new Error("Only the owner can purchase private designs");
  }
};

const addOrder = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    throw new ApiError(403, "Only designers and users can purchase designs");
  }

  const { designIds, paymentMethod,paymentStatus } = req.body;
  let { shippingFee } = req.body;
  
  const userId = req.user._id;

  // Validate input
  if (!designIds || !Array.isArray(designIds)) {
    throw new ApiError(400, "Design IDs must be provided as an array");
  }
  if (designIds.length === 0) {
    throw new ApiError(400, "At least one design must be selected");
  }
  if (shippingFee < 0) {
    throw new ApiError(400, "Shipping fee must be non-negative");
  }
  if (!shippingFee) {
    shippingFee = 3; // Default shipping fee
  }

  // Validate designs
  await Promise.all(
    designIds.map(async (designId) => {
      const design = await Design.findById(designId);
      validateDesignForPurchase(design, userId);
    })
  );

  // Prepare order items
  const orderItems = await prepareOrderItems(designIds, userId);
  const { subtotal, totalAmount, designerEarnings } = calculateOrderTotals(
    orderItems,
    shippingFee
  );

  // Create the order
  const order = await Order.create({
    orderBy: userId,
    designs: orderItems,
    subtotal,
    shippingFee,
    totalAmount,
    designerEarnings,
    paymentMethod: paymentMethod || "COD",
    paymentStatus: "pending",
    deliveryStatus: "pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

const prepareOrderItems = async (designIds, userId) => {
  const designs = await Design.find({
    _id: { $in: designIds },
    $or: [
      { isPublic: true, status: "published" }, // Public designs
      {
        owner: userId,
        status: "published", // Owner's private purchasable designs
      },
    ],
  });

  if (designs.length !== designIds.length) {
    const invalidIds = designIds.filter(
      (id) => !designs.some((d) => d._id.equals(id))
    );
    throw new ApiError(
      400,
      `Invalid or unauthorized designs: ${invalidIds.join(", ")}`
    );
  }

  return designs.map((design) => ({
    design: design._id,
    unitPrice: design.salePrice,
    designerProfit: design.isPublic ? design.designerProfit || 0 : 0,
    quantity: 1,
  }));
};

// Updated to accept shippingFee as a parameter
const calculateOrderTotals = (items, shippingFee) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const designerEarnings = items.reduce(
    (sum, item) => sum + item.designerProfit * item.quantity,
    0
  );

  return {
    subtotal,
    totalAmount: subtotal + shippingFee + designerEarnings, // Shipping fee added here
    designerEarnings,
  };
};

// Delete/cancel an order
const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  // Find and validate order
  const order = await Order.findOne({
    _id: orderId,
    orderBy: userId,
  }).populate("designs.design"); // Populate design details

  if (!order) {
    throw new ApiError(404, "Order not found or not authorized");
  }

  // Check if order can be cancelled
  const orderAgeDays = (new Date() - order.createdAt) / (1000 * 60 * 60 * 24);
  if (orderAgeDays > 2 || order.deliveryStatus !== "pending") {
    throw new ApiError(
      400,
      orderAgeDays > 2
        ? "Order cancellation window has expired (2 days max)"
        : "Order cannot be cancelled after processing has begun"
    );
  }

  // Update order status to cancelled
  const cancelledOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        deliveryStatus: "cancelled",

        $push: {
          statusHistory: {
            status: "cancelled",
            changedAt: new Date(),
            changedBy: userId,
          },
        },
      },
    },
    { new: true }
  ).select("-__v -statusHistory._id"); // Exclude unnecessary fields

  // TODO: Add any refund processing logic here if payment was online
  // This might involve calling your payment gateway API

  return res
    .status(200)
    .json(new ApiResponse(200, cancelledOrder, "Order cancelled successfully"));
});

// Get all orders (admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("orderBy", "username email")
    .populate("designs.design", "name salePrice isPublic");

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({
    _id: orderId,
    $or: [
      { orderBy: userId }, // Owner can view
      {}, // Admin can view (handled by adminOnly middleware)
    ],
  })
    .populate("orderBy", "username email")
    .populate("designs.design", "name salePrice isPublic");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

const getOrderByIdPipeline = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Ensure only admins or the user who placed the order can access the order details
  const designerOwner = await Design.findById(orderId).populate(
    "owner",
    "username email"
  );
  if (
    req.user.role !== "admin" &&
    designerOwner.owner._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "Only admins and the user who placed the order can access this route"
    );
  }

  // Look up the order and populate relevant data
  const order = await Order.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(orderId) } },

    // Lookup for the user (orderBy) who placed the order
    {
      $lookup: {
        from: "users", // Assuming the User collection is named "users"
        localField: "orderBy",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        username: "$userDetails.username",
        fullname: "$userDetails.fullname",
        email: "$userDetails.email", // Adding email as an example, you can add more fields if needed
      },
    },

    // Lookup for the designs in the order
    {
      $unwind: "$designs", // Unwind to deal with array of designs in the order
    },
    {
      $lookup: {
        from: "designs", // Assuming the Design collection is named "designs"
        localField: "designs.design",
        foreignField: "_id",
        as: "designDetails",
      },
    },
    {
      $unwind: { path: "$designDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        "designs.designTitle": "$designDetails.title",
        "designs.designImage": "$designDetails.image", // You can add more fields based on your design model
      },
    },

    // Lookup for the return information (if applicable)
    {
      $lookup: {
        from: "returnorders", // Assuming the ReturnOrder collection is named "returnorders"
        localField: "returnInfo",
        foreignField: "_id",
        as: "returnDetails",
      },
    },
    {
      $unwind: { path: "$returnDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        returnReason: "$returnDetails.reason",
        returnStatus: "$returnDetails.status",
      },
    },

    // Final projection to control the output
    {
      $project: {
        orderBy: 1,
        username: 1,
        fullname: 1,
        email: 1,
        designs: 1,
        subtotal: 1,
        shippingFee: 1,
        totalAmount: 1,
        paymentStatus: 1,
        paymentDate: 1,
        paymentMethod: 1,
        deliveryStatus: 1,
        deliveredDate: 1,
        returnRequested: 1,
        returnReason: 1,
        returnStatus: 1,
        createdAt: 1,
        updatedAt: 1,
        isReturnEligible: 1,
      },
    },
  ]);

  if (!order || order.length === 0) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order[0], "Order retrieved successfully"));
});

// Update delivery status (admin only)
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "processing",
    "shipped",
    "delivered",
    "returned",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid delivery status");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.deliveryStatus = status;

  // Record designer earnings when order is delivered (for public designs)
  if (status === "delivered") {
    order.deliveredDate = new Date();
    await recordDesignerEarnings(order);
  }

  await order.save();
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Delivery status updated"));
});

// Update payment status (admin only)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ["paid", "failed", "refunded"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid payment status");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus: status },
    { new: true }
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Payment status updated"));
});

// Request return (customer)
const requestReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const order = await Order.findOne({
    _id: orderId,
    orderBy: userId,
    deliveryStatus: "delivered",
  });

  if (!order) {
    throw new ApiError(400, "Order not eligible for return");
  }

  // Check if within return window (3 days)
  const returnDays = (new Date() - order.deliveredDate) / (1000 * 60 * 60 * 24);
  if (returnDays > 3) {
    throw new ApiError(400, "Return window has expired (3 days)");
  }

  order.returnRequested = true;
  order.returnReason = reason;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Return requested successfully"));
});

// Process return (admin only)
const processReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Action must be 'approve' or 'reject'");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.returnRequested) {
    throw new ApiError(400, "No return requested for this order");
  }

  if (action === "approve") {
    order.deliveryStatus = "returned";
    order.returned = true;
    // Here you would add logic to reverse designer earnings if needed
  }

  order.returnRequested = false;
  order.returnProcessed = action;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, `Return ${action}d successfully`));
});

export {
  addOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateDeliveryStatus,
  updatePaymentStatus,
  requestReturn,
  processReturn,
  getOrderByIdPipeline,
};
