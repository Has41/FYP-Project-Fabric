import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addPattren,
  allPattren,
  deletePattren,
} from "../controllers/pattren.controller.js";
const router = Router();
router.use(verifyJwt);

router.post("/add", upload.single("pattren"), addPattren);

router.get("/", allPattren);

router.delete("/delete", deletePattren);

export default router;
