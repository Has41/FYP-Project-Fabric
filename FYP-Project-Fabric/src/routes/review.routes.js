import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
    addReview, getReviews, deleteReview, reviewById, getReviewCount
} from "../controllers/review.controller.js";

const router = Router();   


router.route("/add").post(verifyJwt,addReview);
router.get("/", getReviews);
router.get("/review/:userId", getReviews);
router.delete("/:reviewId",adminOnly, deleteReview);
router.get("/count/:productId", getReviewCount);
router.get("/:reviewId", reviewById);

export default router;