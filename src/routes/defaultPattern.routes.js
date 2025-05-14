import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addPattern,
  allPattern,
  deletePattern,
} from "../controllers/defaultPattern.controller.js";
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
  addPattern
);

router.get("/", allPattern);

router.delete("/:patternId", deletePattern);

export default router;
