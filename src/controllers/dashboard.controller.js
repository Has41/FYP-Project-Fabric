import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Design } from "../models/design.model.js";
import { DefaultPattren } from "../models/defaulPattern.model.js";
import { Category } from "../models/category.model.js";
import { Model } from "../models/models.model.js";

// Basic dashboard counts
const getDashboardData = asyncHandler(async (req, res) => {
  const [
    orderCount,
    productCount,
    userCount,
    designCount,
    defaulPatternCount,
    categoryCount,
    modelCount,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Design.countDocuments(),
    DefaultPattren.countDocuments(),
    Category.countDocuments(),
    Model.countDocuments(),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          orderCount,
          productCount,
          userCount,
          designCount,
          defaulPatternCount,
          categoryCount,
          modelCount,
        },
        "Dashboard data fetched successfully."
      )
    );
});

// Stats dashboard with time-based revenue & orders
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ordersToday,
    revenueToday,
    ordersWeek,
    revenueWeek,
    ordersMonth,
    revenueMonth,
    totalUsers,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    User.countDocuments(),
    Product.find({ quantity: { $lt: 10 } }).select("title quantity"),
  ]);

  const stats = {
    totalOrdersToday: ordersToday,
    totalRevenueToday: revenueToday[0]?.total || 0,
    totalOrdersThisWeek: ordersWeek,
    totalRevenueThisWeek: revenueWeek[0]?.total || 0,
    totalOrdersThisMonth: ordersMonth,
    totalRevenueThisMonth: revenueMonth[0]?.total || 0,
    totalUsers,
    lowStockProducts,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully."));
});

const getMostSoldDesign = asyncHandler(async (req, res) => {
  // Aggregate orders to find the most sold design
  const mostSoldDesign = await Order.aggregate([
    { $unwind: "$designs" }, // Assuming the order has a 'designs' field that holds design references
    {
      $group: {
        _id: "$designs", // Group by design (this assumes designs are stored in an array, adjust based on your model)
        totalSales: { $sum: 1 }, // Count how many times each design is ordered
      },
    },
    {
      $lookup: {
        from: "designs", // The collection name for designs in your database
        localField: "_id", // The field we're using to join
        foreignField: "_id", // The design collection's ID field
        as: "designDetails", // Output the details of the design
      },
    },
    {
      $unwind: "$designDetails", // Flatten the design details
    },
    {
      $sort: { totalSales: -1 }, // Sort by totalSales in descending order
    },
    { $limit: 1 }, // Limit to the most sold design
  ]);

  if (!mostSoldDesign.length) {
    return res.status(404).json(new ApiError(404, "No sales data found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        mostSoldDesign[0],
        "Most sold design fetched successfully."
      )
    );
});

const getPaymentStatusStats = asyncHandler(async (req, res) => {
  const [cashOnDeliveryCount, paidCount] = await Promise.all([
    Order.countDocuments({ paymentStatus: "Cash on Delivery" }),
    Order.countDocuments({ paymentStatus: "Paid" })
  ]);

  const stats = {
    cashOnDeliveryCount,
    paidCount,
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Order payment status stats fetched successfully.")
  );
});

const getRevenueByDeliveryStatus = asyncHandler(async (req, res) => {
  const [pendingRevenue, shippedRevenue, deliveredRevenue] = await Promise.all([
    Order.aggregate([
      { $match: { deliveryStatus: "pending" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      { $match: { deliveryStatus: "shipped" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      { $match: { deliveryStatus: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
  ]);

  const stats = {
    pendingRevenue: pendingRevenue[0]?.total || 0,
    shippedRevenue: shippedRevenue[0]?.total || 0,
    deliveredRevenue: deliveredRevenue[0]?.total || 0,
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Revenue by delivery status fetched successfully.")
  );
});

const getDeliveryStatusStats = asyncHandler(async (req, res) => {
  const [pendingCount, shippedCount, deliveredCount] = await Promise.all([
    Order.countDocuments({ deliveryStatus: "pending" }),
    Order.countDocuments({ deliveryStatus: "shipped" }),
    Order.countDocuments({ deliveryStatus: "delivered" })
  ]);

  const stats = {
    pendingCount,
    shippedCount,
    deliveredCount,
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Order delivery status stats fetched successfully.")
  );
});



export {
  getDashboardData,
  getDashboardStats,
  getMostSoldDesign,
  getDeliveryStatusStats,
  getPaymentStatusStats,
  getRevenueByDeliveryStatus
};
