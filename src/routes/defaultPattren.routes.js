import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addPattren,
  allPattren,
  deletePattren,
} from "../controllers/defaultPattren.controller.js";
import { adminOnly } from "../middleware/admin.middleware.js";
const router = Router();
router.use(verifyJwt);

router.post(
  "/add",
  adminOnly,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      // `any()` handles single or multiple file uploads
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  addPattren
);

router.get("/", allPattren);

router.delete("/delete", deletePattren);

export default router;
