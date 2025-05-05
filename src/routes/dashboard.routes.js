import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  getDashboardData,
  getDashboardStats,
  getRevenueByDeliveryStatus,
  getPaymentStatusStats,
  getDeliveryStatusStats,
  
} from "../controllers/dashboard.controller.js";

const router = Router();

// All routes below are protected for admins only
router.use(verifyJwt, adminOnly);

router.get("/basic-data", getDashboardData);                     // Counts of orders, products, etc.
router.get("/stats", getDashboardStats);                         // Time-based orders & revenue
// router.get("/most-sold-design", getMostSoldDesign);              // Top selling design
router.get("/delivery-status-stats", getDeliveryStatusStats);    // Count of each delivery status
router.get("/payment-status-stats", getPaymentStatusStats);      // Count of each payment type
router.get("/revenue-by-delivery-status", getRevenueByDeliveryStatus); // Revenue per delivery stage

export default router;
