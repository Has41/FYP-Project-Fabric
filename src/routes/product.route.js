import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addProduct,
  allProducts,
  removeProduct,
  searchProduct,
  updateProductInfo,
  updateProductPics,
} from "../controllers/product.controller.js";

const router = Router();
router.use(verifyJwt);

router.post("/add", upload.array("images", 4), addProduct);

router.delete("/:productId", removeProduct);

router.put("/update/:productId", updateProductInfo);

router.patch(
  "/update-images/:productId",
  upload.array("images", 4),
  updateProductPics
);

router.get("/:productId", searchProduct);

router.get("/all-products", allProducts);

export default router;
