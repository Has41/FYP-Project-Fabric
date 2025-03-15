import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  addProduct,
  allProducts,
  removeProduct,
  searchProduct,
  updateProductInfo,
} from "../controllers/product.controller.js";

const router = Router();


router.route("/add").post(adminOnly, addProduct);

router.route("/:productId").delete(adminOnly, removeProduct);

router.route("/update/:productId").put(adminOnly, updateProductInfo);

router.get("/get/:productId", searchProduct);

router.get("/all-products", allProducts);

export default router;
