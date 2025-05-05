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
    returnedOrdersToday,
    returnedOrdersThisWeek,
    returnedOrdersThisMonth,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay }, returned: { $ne: true } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, returned: { $ne: true } } }, // Exclude returned orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfWeek }, returned: { $ne: true } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, returned: { $ne: true } } }, // Exclude returned orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfMonth }, returned: { $ne: true } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, returned: { $ne: true } } }, // Exclude returned orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
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

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully."));
});

// Revenue by Delivery Status (excluding returns)
const getRevenueByDeliveryStatus = asyncHandler(async (req, res) => {
  const [pendingRevenue, shippedRevenue, deliveredRevenue, returnedRevenue] = await Promise.all([
    Order.aggregate([
      { $match: { deliveryStatus: "pending", returned: { $ne: true } } }, // Exclude returned orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      { $match: { deliveryStatus: "shipped", returned: { $ne: true } } }, // Exclude returned orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      { $match: { deliveryStatus: "delivered", returned: { $ne: true } } }, // Exclude returned orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([ // Subtract revenue of returned orders
      { $match: { returned: true } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
  ]);

  const stats = {
    pendingRevenue: pendingRevenue[0]?.total || 0,
    shippedRevenue: shippedRevenue[0]?.total || 0,
    deliveredRevenue: deliveredRevenue[0]?.total || 0,
    returnedRevenue: returnedRevenue[0]?.total || 0, // This will now show how much revenue was returned
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Revenue by delivery status fetched successfully.")
  );
});

// Other stats for Payment and Delivery Status
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
  getRevenueByDeliveryStatus,
  getPaymentStatusStats,
  getDeliveryStatusStats
};
