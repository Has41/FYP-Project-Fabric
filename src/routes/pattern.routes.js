import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addPattern,
  allPatterns,
  deletePattern,
  getAllPatterns,
  getPatternById
} from "../controllers/pattern.controller.js";

const router = Router();
router.use(verifyJwt);

router.post("/add", upload.single("pattern"), addPattern);

router.get("/", allPatterns);

router.delete('/delete/:patternId', deletePattern);

router.get("/:patternId", getPatternById);

router.get("/all", getAllPatterns);


export default router;
