import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

import {
  addGraphic,
  updateGraphic,
  deleteGraphic,
  getUserGraphics,
  getGraphicById,
} from "../controllers/graphic.controller.js";

const router = Router();

router.post("/add", verifyJwt, upload.single("images"), addGraphic);
router.put("/update/:id", verifyJwt, updateGraphic);
router.delete("/delete/:id", verifyJwt, deleteGraphic);
router.get("/user", verifyJwt, getUserGraphics);
router.get("/:id", verifyJwt, getGraphicById);

export default router;
