import {Router} from "express";
import {verifyJwt} from "../middleware/auth.middleware.js";
import {adminOnly} from "../middleware/admin.middleware.js";
import {upload} from "../middleware/multer.middleware.js";
import {addModel, deleteModel, getAllModels, getModelsByUser, getModelById} from "../controllers/model.controller.js";

const router = Router();
router.use(verifyJwt, adminOnly);

router.post("/add",upload.single("model"), addModel);
router.delete("/delete/:modelId", deleteModel);
router.get("/", getAllModels);
router.get("/user/:userId", getModelsByUser);
router.get("/:modelId", getModelById);


export default router;