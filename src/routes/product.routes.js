import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

import {
  addProduct,
  allProducts,
  removeProduct,
  searchProduct,
  updateProductInfo,
  updateProductModel,
} from "../controllers/product.controller.js";

const router = Router();
router.use(verifyJwt);

router.post("/add", upload.single("model"), addProduct);

router.delete("/:productId", removeProduct);

router.put("/update/:productId", updateProductInfo);

router.patch(
  "/update-model/:productId",
  upload.single("model"),
  updateProductModel
);

router.get('/get/:productId', searchProduct);


router.get("/all-products", allProducts);

export default router;
