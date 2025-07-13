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
  processReturn,
  getOrderByIdPipeline,
  handleStripeWebhook,
  createOrder,
  verifyPayment
} from "../controllers/order.controller.js";

const router = Router();

// Apply JWT verification to all order routes except webhook
router.use((req, res, next) => {
  // Skip JWT verification for Stripe webhook
  if (req.path === '/stripe-webhook') {
    return next();
  }
  verifyJwt(req, res, next);
});

router.route("/verify-payment").post(verifyPayment);
// Customer routes
router.route("/")
  .post(addOrder); // Create new order

router.route("/create")
  .post(createOrder);

router.route("/:orderId")
  .delete(deleteOrder); // Cancel order

router.post("/:orderId/return", requestReturn); // Request return

// Stripe webhook route - must be before JSON middleware and without auth
router.route("/stripe-webhook").post(
  // Use raw body parser for Stripe webhook
  Router().use((req, res, next) => {
    express.raw({ type: 'application/json' })(req, res, next);
  }),
  handleStripeWebhook
);

// Admin-only routes
router.get("/", adminOnly, getAllOrders); // Get all orders
router.get("/:orderId", getOrderById); // Get order details
router.get("/:orderId/pipeline", getOrderByIdPipeline); // Get order details
router.put("/:orderId/delivery", adminOnly, updateDeliveryStatus); // Update delivery status
router.put("/:orderId/payment", adminOnly, updatePaymentStatus); // Update payment status
router.put("/:orderId/process-return", adminOnly, processReturn); // Process return request

export default router;