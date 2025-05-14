import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createDesign,
  getMyDesigns,
  getPublicDesignsByUser,
  getDesignById,
  updateDesign,
  toggleDesignPublicStatus,
  deleteDesign,
  getAllDesigns,
  getAllPublicDesigns,
  getDesignByIdSimple,
  pushText,
  pushGraphic
} from "../controllers/design.controller.js";

const router = Router();

// Public routes
router.get("/public", getAllPublicDesigns);
router.get("/user/:userId/public", getPublicDesignsByUser);

// Authenticated routes
router.use(verifyJwt);

// User design management
router.post('/push-text/:designId',pushText);
router.post('/push-graphic/:designId',pushGraphic);
router.post("/",upload.single("image"),createDesign);
router.get("/my-designs", getMyDesigns);
router.get("/:designId", getDesignById);
router.put("/:designId",upload.single("image"), updateDesign);
router.put("/:designId/public", toggleDesignPublicStatus);
router.delete("/:designId", deleteDesign);

// Simple routes
router.get("/simple/:designId", getDesignByIdSimple);

// Admin routes
router.get("/", adminOnly, getAllDesigns);

export default router;