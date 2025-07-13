import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Design } from "../models/design.model.js";
import mongoose from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET);

const validateDesignForPurchase = (design, userId) => {
  if (!design.isPublic && !design.owner.equals(userId)) {
   
    throw new Error("Only the owner can purchase private designs");
  }
};

const addOrder = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    throw new ApiError(403, "Only designers and users can purchase designs");
  }

  const { designIds, paymentMethod,paymentStatus, shippingAddress } = req.body;
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
    shippingAddress,
    paymentStatus: paymentStatus,
    paymentMethod: paymentMethod || "COD",
    deliveryStatus: "pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

// controller
const verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== "paid") {
    return res.status(400).json(new ApiResponse(400, null, "Payment not completed"));
  }

  const order = await Order.findById(session.metadata.orderId);
  if (!order) {
    return res.status(404).json(new ApiResponse(404, null, "Order not found"));
  }

  order.paymentStatus = "paid";
  order.paymentDate = new Date();
  await order.save();

  res.status(200).json(new ApiResponse(200, null, "Payment verified"));
});

const createOrder = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    throw new ApiError(403, "Only designers and users can purchase designs");
  }

  const { designIds, paymentMethod, paymentStatus, shippingAddress } = req.body;
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

  // Create the order in pending state
  const order = await Order.create({
    orderBy: userId,
    designs: orderItems,
    subtotal,
    shippingFee,
    totalAmount,
    designerEarnings,
    shippingAddress,
    paymentStatus: paymentMethod === "online" ? "pending" : paymentStatus || "pending",
    paymentMethod: paymentMethod || "COD",
    deliveryStatus: "pending",
  });

  // If payment method is online, create Stripe checkout session
  if (paymentMethod === "online") {
    try {
      // Create line items for Stripe
      const lineItems = orderItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Design ${item.design.toString()}`,
            // You might want to add more product details here
          },
          unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Add shipping fee as a separate line item if needed
      if (shippingFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping Fee',
            },
            unit_amount: Math.round(shippingFee * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/order/canceled`,
        client_reference_id: order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          userId: userId.toString(),
        },
      });

      // Return the Stripe session URL to the frontend
      return res.status(200).json(new ApiResponse(200, { 
        order, 
        stripeSessionUrl: session.url 
      }, "Stripe checkout session created"));

    } catch (error) {
      // If Stripe fails, delete the order we just created
      await Order.findByIdAndDelete(order._id);
      throw new ApiError(500, `Stripe error: ${error.message}`);
    }
  }

  // For COD payments, just return the order
  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

// Add a new endpoint to handle Stripe webhooks
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Update the order status
    const order = await Order.findById(session.metadata.orderId);
    if (!order) {
      console.error(`Order not found: ${session.metadata.orderId}`);
      return res.status(404).json(new ApiResponse(404, null, "Order not found"));
    }

    // Verify the payment was successful
    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paid';
      order.paymentDate = new Date();
      await order.save();
      
      // Here you might want to trigger other actions like sending confirmation emails
      console.log(`Order ${order._id} payment confirmed`);
    }
  }

  res.status(200).json(new ApiResponse(200, null, "Webhook received"));
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
  const isAdmin = req.user.role === 'admin';

  // Find and validate order
  const order = await Order.findOne({
    _id: orderId,
    // If user is admin, don't filter by orderBy (can access any order)
    ...(isAdmin ? {} : { orderBy: userId })
  }).populate("designs.design"); // Populate design details

  if (!order) {
    throw new ApiError(404, "Order not found" + (isAdmin ? "" : " or not authorized"));
  }

  // Check if order can be cancelled (admins might bypass some restrictions)
  const orderAgeDays = (new Date() - order.createdAt) / (1000 * 60 * 60 * 24);
  
  // Admins can cancel orders regardless of age or status
  if (!isAdmin) {
    if (orderAgeDays > 2 || order.deliveryStatus !== "pending") {
      throw new ApiError(
        400,
        orderAgeDays > 2
          ? "Order cancellation window has expired (2 days max)"
          : "Order cannot be cancelled after processing has begun"
      );
    }
  }

  // Update order status to cancelled
  const cancelledOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        deliveryStatus: "cancelled",
      },
      $push: {
        statusHistory: {
          status: "cancelled",
          changedAt: new Date(),
          changedBy: userId,
          changedByRole: req.user.role // Optional: track who made the change
        }
      }
    },
    { new: true }
  ).select("-__v -statusHistory._id"); // Exclude unnecessary fields

  // TODO: Add any refund processing logic here if payment was online
  // This might involve calling your payment gateway API
  // Note: For admin cancellations, you might want different refund handling

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
  createOrder,
  handleStripeWebhook,
  verifyPayment
};
