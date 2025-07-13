import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  addProduct,
  removeProduct,
  updateProductInfo,
  allProducts,
  searchProduct
} from "../controllers/product.controller.js";

const productRouter = Router();

// Admin route to add a product
productRouter.route("/add").post(verifyJwt, adminOnly, addProduct);

// Admin route to remove a product
productRouter.route("/:productId").delete(verifyJwt, adminOnly, removeProduct);

// Admin route to update product info
productRouter.route("/update/:productId").put(verifyJwt, adminOnly, updateProductInfo);

// Route to search for a product (can be accessed by any user)
productRouter.get("/get/:productId", searchProduct);

// Route to get all products (can be accessed by any user)
productRouter.get("/all-products", allProducts);

export default productRouter;
