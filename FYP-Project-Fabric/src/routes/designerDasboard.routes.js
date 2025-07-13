import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { designerOnly } from "../middleware/designer.middleware.js"; 
import {
  getDesignerDashboardData,
  getTopSellingDesigns,
  getMonthlyRevenueTrend,
  getDesignerDashboardStats
} from "../controllers/designerDashboard.controller.js";

const router = Router();

// All routes below are protected for designers only
router.use(verifyJwt, designerOnly);

router.get("/dashboard", getDesignerDashboardData);           // Designer dashboard data
router.get("/top-selling-designs", getTopSellingDesigns);    // Top-selling designs
router.get("/monthly-revenue", getMonthlyRevenueTrend);      // Monthly revenue trend
router.get("/stats", getDesignerDashboardStats);             // Designer dashboard stats
export default router;
