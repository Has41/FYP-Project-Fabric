import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addText,
  searchByUser,
  searchById,
  deleteText,
  updateText,
  allText
} from "../controllers/text.controller.js";

const router = Router();

router.post("/add", verifyJwt, addText);
router.get("/user", verifyJwt, searchByUser);
router.get("/:id", verifyJwt, searchById);
router.put("/update/:id", verifyJwt, updateText);
router.delete("/delete/:id", verifyJwt, deleteText);
router.get("/all", verifyJwt, allText);

export default router;
