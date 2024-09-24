import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { addProduct } from "../controlllers/product.controller.js";  // Assuming this is where addProduct is located

const router = Router();
router.use(verifyJwt);

router.post('/add', upload.array('images', 4), addProduct);

export default router;
