import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { addProduct } from "../controlllers/product.controller.js";  // Assuming this is where addProduct is located

const router = Router();

// Route to add a product
// Applies authentication middleware (verifyJwt) and file upload middleware (upload)
router.post('/add', verifyJwt, upload.array('images', 4), addProduct);

export default router;
