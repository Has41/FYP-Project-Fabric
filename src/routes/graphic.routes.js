import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addGraphic,
  deleteGraphic,
  updateGraphic,
  searchGraphic,
  allUserGraphics,
} from "../controllers/graphic.controller.js";

const router = Router();

router.post("/add", verifyJwt, addGraphic);
router.get("/search", verifyJwt, searchGraphic);
router.get("/", verifyJwt, allUserGraphics);
router.put("/update/:id", verifyJwt, updateGraphic);
router.delete("/delete/:id", verifyJwt, deleteGraphic);

export default router;
