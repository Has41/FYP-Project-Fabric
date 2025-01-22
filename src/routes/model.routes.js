import {Router} from "express";
import {verifyJwt} from "../middleware/auth.middleware.js";
import {adminOnly} from "../middleware/admin.middleware.js";
import {upload} from "../middleware/multer.middleware.js";
import {addModel, deleteModel} from "../controllers/model.controller.js";

const router = Router();
router.use(verifyJwt, adminOnly);

router.post("/add",upload.single("model"), addModel);
router.delete("/delete/:modelId", deleteModel);

export default router;