import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Design } from "../models/design.model.js";
import { Category } from "../models/category.model.js";
import { Model } from "../models/models.model.js";

// 1. Basic counts
const getDashboardData = asyncHandler(async (req, res) => {
  const [
    orderCount,
    productCount,
    userCount,
    designCount,
    categoryCount,
    modelCount
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Design.countDocuments(),
    Category.countDocuments(),
    Model.countDocuments(),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    orderCount,
    productCount,
    userCount,
    designCount,
    categoryCount,
    modelCount,
  }, "Dashboard data fetched successfully."));
});

// 2. Time-based revenue and order stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
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
    returnedOrdersToday,
    returnedOrdersThisWeek,
    returnedOrdersThisMonth
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay }, returned: { $ne: true } }),
    Order.aggregate([{ $match: { createdAt: { $gte: startOfDay }, returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.countDocuments({ createdAt: { $gte: startOfWeek }, returned: { $ne: true } }),
    Order.aggregate([{ $match: { createdAt: { $gte: startOfWeek }, returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.countDocuments({ createdAt: { $gte: startOfMonth }, returned: { $ne: true } }),
    Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth }, returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    User.countDocuments(),
    Product.find({ quantity: { $lt: 10 } }).select("title quantity"),
    Order.countDocuments({ createdAt: { $gte: startOfDay }, returned: true }),
    Order.countDocuments({ createdAt: { $gte: startOfWeek }, returned: true }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth }, returned: true }),
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
    returnedOrdersToday,
    returnedOrdersThisWeek,
    returnedOrdersThisMonth,
  };

  return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched successfully."));
});

// 3. Revenue by delivery status
const getRevenueByDeliveryStatus = asyncHandler(async (req, res) => {
  const [pending, shipped, delivered,processing, returned] = await Promise.all([
    Order.aggregate([{ $match: { deliveryStatus: "pending", returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { deliveryStatus: "shipped", returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { deliveryStatus: "delivered", returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { deliveryStatus: "processing", returned: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { returned: true } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    pendingRevenue: pending[0]?.total || 0,
    shippedRevenue: shipped[0]?.total || 0,
    deliveredRevenue: delivered[0]?.total || 0,
    returnedRevenue: returned[0]?.total || 0,
    processingRevenue: processing[0]?.total || 0
  }, "Revenue by delivery status fetched successfully."));
});

// 4. Order payment method stats
const getPaymentStatusStats = asyncHandler(async (req, res) => {
  const [cod, paid, failed, refunded] = await Promise.all([
    Order.countDocuments({ paymentStatus: "pending" }),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.countDocuments({ paymentStatus: "failed" }),
    Order.countDocuments({ paymentStatus: "refunded" }),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    cashOnDeliveryCount: cod,
    paidCount: paid,
    failedCount: failed,
    refundedCount: refunded,
  }, "Payment status stats fetched successfully."));
});

// 5. Order delivery status stats
const getDeliveryStatusStats = asyncHandler(async (req, res) => {
  const [pending, shipped, delivered, processing, returned, canceled] = await Promise.all([
    Order.countDocuments({ deliveryStatus: "pending" }),
    Order.countDocuments({ deliveryStatus: "shipped" }),
    Order.countDocuments({ deliveryStatus: "delivered" }),
    Order.countDocuments({ deliveryStatus: "processing" }),
    Order.countDocuments({ deliveryStatus: "returned" }),
    Order.countDocuments({ deliveryStatus: "canceled" }),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    pendingCount: pending,
    shippedCount: shipped,
    deliveredCount: delivered,
    processingCount: processing,
    returnedCount: returned,
    canceledCount: canceled,
  }, "Delivery status stats fetched successfully."));
});

// ✅ Optional: Most sold product/design
const getMostSoldDesign = asyncHandler(async (req, res) => {
  const result = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.design": { $ne: null } } },
    { $group: { _id: "$items.design", count: { $sum: "$items.quantity" } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "designs",
        localField: "_id",
        foreignField: "_id",
        as: "design"
      }
    },
    { $unwind: "$design" },
    { $project: { count: 1, design: 1 } }
  ]);

  return res.status(200).json(new ApiResponse(200, result[0] || {}, "Top selling design fetched."));
});

// ✅ Optional: Monthly revenue trend
const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const revenue = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        },
        returned: { $ne: true }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: "$totalAmount" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  return res.status(200).json(new ApiResponse(200, revenue, "Monthly revenue trend fetched."));
});

// ✅ Optional: Monthly user signups
const getUserSignupStats = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const stats = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  return res.status(200).json(new ApiResponse(200, stats, "Monthly user signups fetched."));
});

export {
  getDashboardData,
  getDashboardStats,
  getRevenueByDeliveryStatus,
  getPaymentStatusStats,
  getDeliveryStatusStats,
  getMostSoldDesign,
  getMonthlyRevenue,
  getUserSignupStats
};
