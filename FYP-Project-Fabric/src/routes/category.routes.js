import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addCategory,
  allCategories,
  categoryById,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const router = Router();
router.use(verifyJwt);

router.post("/", addCategory); // Create a new category
router.get("/", allCategories); // Get all categories
router.get("/:categoryId", categoryById); // Get a category by ID
router.put("/:categoryId", updateCategory); // Update a category by ID
router.delete("/:categoryId", deleteCategory); // Delete a category by ID

export default router;
