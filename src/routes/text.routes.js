import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addText,
  searchByUser,
  searchById,
  deleteText,
  updateText,
  allText,
  getUserTexts
} from "../controllers/text.controller.js";

const router = Router();

router.post("/add", verifyJwt, addText);
router.get("/user", verifyJwt, searchByUser);
router.get("/:id", verifyJwt, searchById);
router.put("/update/:id", verifyJwt, updateText);
router.delete("/delete/:id", verifyJwt, deleteText);
router.get("/", verifyJwt, allText); 
router.get("/user", verifyJwt, getUserTexts);

export default router;
