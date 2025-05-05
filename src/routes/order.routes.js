import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  getAllOrders,
  updateDeliveryStatus,
  updatePaymentStatus,
  getOrderById,
  addOrder,
  deleteOrder,
  returnedOrder,
  approveReturn,
} from "../controllers/order.controller.js";

const router = Router();

// All routes below are protected for admins only
router.use(verifyJwt);

// routes/order.routes.js
router.get("/", adminOnly, getAllOrders);
router.post("/", addOrder);
router.get("/:orderId", adminOnly, getOrderById);
router.patch("/update-delivery/:orderId", adminOnly, updateDeliveryStatus);
router.patch("/update-payment/:orderId", adminOnly, updatePaymentStatus);
router.delete("/:orderId", adminOnly, deleteOrder);
router.patch("/return/:orderId", returnedOrder);
router.put("/approve-return/:returnId", adminOnly, verifyJwt, approveReturn);

export default router;
