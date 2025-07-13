import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

import {
  getDashboardData,
  getDashboardStats,
  getRevenueByDeliveryStatus,
  getPaymentStatusStats,
  getDeliveryStatusStats,
  getMostSoldDesign,
  getMonthlyRevenue,
  getUserSignupStats,
} from "../controllers/adminDashboard.controller.js";

const router = Router();

router.use(verifyJwt, adminOnly);

router.get("/basic-data", getDashboardData);
router.get("/stats", getDashboardStats);
router.get("/delivery-status-stats", getDeliveryStatusStats);
router.get("/payment-status-stats", getPaymentStatusStats);
router.get("/revenue-by-delivery-status", getRevenueByDeliveryStatus);

// ✅ Optional insights
router.get("/top-design", getMostSoldDesign);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/monthly-signups", getUserSignupStats);

export default router;
