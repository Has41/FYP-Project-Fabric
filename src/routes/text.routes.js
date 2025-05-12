import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addText,
  allText,
  updateText,
  deleteText,
  searchText,
} from "../controllers/text.controller.js";

const router = Router();

// Create text (requires authentication)
router.post("/add", verifyJwt, addText);

// Get all texts (requires authentication)
router.get("/", verifyJwt, allText);

// Search texts (requires authentication)
router.get("/search", verifyJwt, searchText);

// Update text (requires authentication)
router.put("/update/:id", verifyJwt, updateText);

// Delete text (requires authentication)
router.delete("/delete/:id", verifyJwt, deleteText);

export default router;
