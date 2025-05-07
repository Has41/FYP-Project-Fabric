import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  addOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateDeliveryStatus,
  updatePaymentStatus,
  requestReturn,
  processReturn
} from "../controllers/order.controller.js";

const router = Router();

// Apply JWT verification to all order routes
router.use(verifyJwt);

// Customer routes
router.route("/")
  .post(addOrder); // Create new order

router.route("/:orderId")
  .delete(deleteOrder); // Cancel order

router.post("/:orderId/return", requestReturn); // Request return

// Admin-only routes
router.get("/", adminOnly, getAllOrders); // Get all orders
router.get("/:orderId", adminOnly, getOrderById); // Get order details

router.put("/:orderId/delivery", adminOnly, updateDeliveryStatus); // Update delivery status
router.put("/:orderId/payment", adminOnly, updatePaymentStatus); // Update payment status
router.put("/:orderId/process-return", adminOnly, processReturn); // Process return request

export default router;