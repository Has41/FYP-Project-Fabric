import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addPattren,
  allPatterns,
  deletePattren,
  getPattrenById
} from "../controllers/pattren.controller.js";
const router = Router();
router.use(verifyJwt);

router.post("/add", upload.single("pattren"), addPattren);

router.get("/", allPatterns);

router.delete('/delete/:pattrenId', deletePattren);

router.get("/:pattrenId", getPattrenById);


export default router;
