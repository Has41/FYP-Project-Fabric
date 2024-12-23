import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addColor,
  allColors,
  deleteColor,
  getColor,
  updateColor,
} from "../controllers/color.controller.js";

const router = Router();
router.use(verifyJwt);

router.post("/", addColor); // Create a new color
router.get("/", allColors); // Get all colors
router.get("/:colorId", getColor); // Get a color by ID
router.put("/:colorId", updateColor); // Update a color by ID
router.delete("/:colorId", deleteColor); // Delete a color by ID

export default router;
