import { Review } from "../models/review.model.js";
import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment, productId, designId } = req.body;
    const userId = req.user._id;

    if (!productId && !designId) {
      throw new ApiError(400, "productId or designId is required");
    }

    // Check if the user has a delivered order for this product or design
    const orderFilter = {
      user: userId,
      deliveryStatus: "delivered",
      $or: [],
    };

    if (productId) orderFilter.$or.push({ "products.product": productId });
    if (designId) orderFilter.$or.push({ "products.design": designId });

    const hasDeliveredOrder = await Order.exists(orderFilter);

    if (!hasDeliveredOrder) {
      throw new ApiError(
        403,
        "You can only review delivered products or designs"
      );
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      design: designId,
      rating,
      comment,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, review, "Review added successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Review already exists");
    }
    throw new ApiError(500, "Failed to add review");
  }
});

const getReviews = asyncHandler(async (req, res) => {
  try {
    const { productId, designId } = req.query;

    if (!productId && !designId) {
      throw new ApiError(400, "productId or designId is required");
    }

    const filter = {};
    if (productId) filter.product = productId;
    if (designId) filter.design = designId;

    const reviews = await Review.find(filter)
      .populate("user", "name avatar") // include basic user info
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch reviews");
  }
});

const deleteReview = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized");
  }
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Review deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to delete review");
  }
});

const reviewById = asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, review, "Review fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch review");
  }
});

const getReviewCount = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    throw new ApiError(400, "productId is required");
  }

  const count = await Review.countDocuments({ product: productId });

  res
    .status(200)
    .json(new ApiResponse(200, { count }, "Review count fetched successfully"));
});

export { addReview, getReviews, deleteReview, reviewById, getReviewCount };
