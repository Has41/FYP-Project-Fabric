import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  addDesign,
  allDesign,
  designById,
  publicDesign,
  publicDesignById,
  publicDesignByUserId,
  designByUserId,
  privateDesignByUserId,
  updateDesign,
  deleteDesign,
} from "../controllers/design.controller.js";

const router = Router();

// Admin-only routes
router.route("/add").post(verifyJwt, adminOnly, addDesign);
router.route("/:designId").delete(verifyJwt, adminOnly, deleteDesign);
router.route("/update/:designId").put(verifyJwt, adminOnly, updateDesign);

// Authenticated user routes (verifyJwt only)
router.get("/my-designs", verifyJwt, designByUserId);
router.get("/my-public-designs", verifyJwt, publicDesignByUserId);
router.get("/my-private-designs", verifyJwt, privateDesignByUserId);

// Public routes (no auth required)
router.get("/all", allDesign);
router.get("/public", publicDesign);
router.get("/public/:designId", publicDesignById);
router.get("/:designId", designById);

export default router;