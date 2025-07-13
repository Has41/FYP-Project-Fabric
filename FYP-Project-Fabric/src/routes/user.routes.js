import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
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
  verifyEmail,
  getDesignerBankInfo,
  getUserDashboardStats,
  getAllUsers,
  deleteUserById,
  deleteUserByIdAdmin,
  changeRole,
  getUserBankInfoById,
  addBankInfo,
  updateBankInfo,
} from "../controllers/user.controller.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.post("/verify-email", verifyEmail);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshToken);

router.route("/change-password").post(verifyJwt, currentPasswordChange);

router.route("/update-details").patch(verifyJwt, updateAccountDetails);

router.route("/get-user").get(verifyJwt, getCurrentUser);

router.route("/all-users").get(verifyJwt, adminOnly, getAllUsers);

router
  .route("/delete-user-admin/:userId")
  .delete(verifyJwt, adminOnly, deleteUserByIdAdmin);

router.route("/delete-user/:userId").delete(verifyJwt, deleteUserById);

router.route("/change-role/:userId").patch(verifyJwt, changeRole);

router.route("/bank-info/:userId").get(verifyJwt, getUserBankInfoById);

router.route("/add-bank-info").post(verifyJwt, addBankInfo);

router.route("/update-bank-info").patch(verifyJwt, updateBankInfo);

router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvtar);

router.route("/up/:username").get(verifyJwt, userProfile);

router.route("/ap/:username").get(verifyJwt, adminProfile);

router.route("/order-history").get(verifyJwt, orderHistory);

router.route("/bank-info").get(verifyJwt, getDesignerBankInfo);

router.route("/dashboard-stats").get(verifyJwt, getUserDashboardStats);

export default router;
