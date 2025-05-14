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
  upload.single("pattern"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    next();
  },
  addPattern
);

router.get("/", allPattern);

router.delete("/:patternId", deletePattern);

export default router;
