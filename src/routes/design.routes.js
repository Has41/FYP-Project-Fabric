import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { designerOnly } from "../middleware/designer.middleware.js";
import {
  createDesign,
  getMyDesigns,
  getPublicDesignsByUser,
  getDesignById,
  updateDesign,
  toggleDesignPublicStatus,
  updateDesignPurchasableStatus,
  deleteDesign,
  getAllDesigns,
  getAllPublicDesigns
} from "../controllers/design.controller.js";

const router = Router();

// Public routes
router.get("/public", getAllPublicDesigns);
router.get("/user/:userId/public", getPublicDesignsByUser);

// Authenticated routes
router.use(verifyJwt);

// User design management
router.post("/",createDesign);
router.get("/my-designs", getMyDesigns);
router.get("/:designId", getDesignById);
router.put("/:designId", updateDesign);
router.put("/:designId/public", toggleDesignPublicStatus);
router.put("/:designId/purchasable", updateDesignPurchasableStatus);
router.delete("/:designId", deleteDesign);

// Admin routes
router.get("/", adminOnly, getAllDesigns);

export default router;