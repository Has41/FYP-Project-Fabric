import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  adminProfile,
  currentPasswordChange,
  getCurrentUser,
  loginUser,
  logoutUser,
  orderHistory,
  refreshToken,
  registerUser,
  updateAccountDetails,
  updateUserAvtar,
  userProfile,
} from "../controlllers/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshToken);

router.route("/change-password").post(verifyJwt, currentPasswordChange);

router.route("/update-details").patch(verifyJwt, updateAccountDetails);

router.route("/get-user").get(getCurrentUser);

router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvtar);

router.route("/up/:username").get(verifyJwt, userProfile);

router.route("/ap/:username").get(verifyJwt, adminProfile);

router.route("/order-history").get(verifyJwt, orderHistory);
