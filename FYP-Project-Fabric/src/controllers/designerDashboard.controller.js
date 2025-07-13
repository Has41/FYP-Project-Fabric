import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Design } from "../models/design.model.js";
import mongoose from "mongoose";

// Get designer's dashboard data
const getDesignerDashboardData = asyncHandler(async (req, res) => {
  const designerId = req.user._id; // Get the logged-in designer's ID from JWT (req.user)

  // Get total designs, total orders involving designer's designs, and total revenue
  const [totalDesigns, totalOrders, totalRevenue, pendingOrders] =
    await Promise.all([
      Design.countDocuments({ owner: designerId }), // Designs created by the designer
      Order.countDocuments({ "designs.owner": designerId }), // Orders including the designer's designs
      Order.aggregate([
        // Sum of revenue from orders involving designer's designs
        { $match: { "designs.owner": designerId, returned: { $ne: true } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({
        "designs.owner": designerId,
        status: "pending",
      }), // Pending orders involving the designer's designs
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalDesigns,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
      },
      "Designer dashboard data fetched successfully."
    )
  );
});

const getDesignerDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Current logged-in designer

  // Fetching all orders where the logged-in user is the designer or has designs
  const stats = await Order.aggregate([
    {
      $unwind: "$designs", // Unwind the designs array
    },
    {
      $lookup: {
        from: "designs",
        localField: "designs.design",
        foreignField: "_id",
        as: "designDetails",
      },
    },
    {
      $unwind: "$designDetails", // Unwind the designDetails object
    },
    {
      $match: {
        "designDetails.owner": new mongoose.Types.ObjectId(userId), // Fixed: Added 'new' keyword
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $multiply: ["$designs.unitPrice", "$designs.quantity"] },
        }, // Calculate total revenue
        totalDesignerProfit: {
          $sum: { $multiply: ["$designs.designerProfit", "$designs.quantity"] },
        },
        totalOrders: { $sum: 1 }, // Count total orders
      },
    },
  ]);

  if (stats.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No data available for this designer"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        stats[0],
        "Designer dashboard stats fetched successfully"
      )
    );
});

// Get top-selling designs (based on quantity sold)
const getTopSellingDesigns = asyncHandler(async (req, res) => {
  const designerId = req.user._id;

  const topSellingDesigns = await Order.aggregate([
    { $unwind: "$designs" },
    { $match: { "designs.owner": designerId, returned: { $ne: true } } },
    {
      $group: {
        _id: "$designs._id",
        totalSold: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "designs",
        localField: "_id",
        foreignField: "_id",
        as: "design",
      },
    },
    { $unwind: "$design" },
    { $project: { _id: 0, designName: "$design.name", totalSold: 1 } },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }, // Limit to top 10 selling designs
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        topSellingDesigns,
        "Top selling designs fetched successfully."
      )
    );
});

// Get monthly revenue trend
const getMonthlyRevenueTrend = asyncHandler(async (req, res) => {
  const designerId = req.user._id;

  const monthlyRevenue = await Order.aggregate([
    { $match: { "designs.owner": designerId, returned: { $ne: true } } },
    {
      $group: {
        _id: { $month: "$createdAt" }, // Group by month
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } }, // Sort by month ascending
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlyRevenue,
        "Monthly revenue trend fetched successfully."
      )
    );
});

export {
  getDesignerDashboardData,
  getTopSellingDesigns,
  getMonthlyRevenueTrend,
  getDesignerDashboardStats,
};
