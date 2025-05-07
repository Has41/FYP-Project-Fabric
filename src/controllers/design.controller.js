import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Design } from "../models/design.model.js";
import mongoose from "mongoose";

// Create a new design (private by default)
const createDesign = asyncHandler(async (req, res) => {
  const {
    name,
    product,
    color,
    pattern,
    defaultPattern,
    text,
    graphic,
    basePrice, // which is price in product
  } = req.body;

  // Validation
  if (!name || !product || !color || !basePrice) {
    throw new ApiError(400, "Required fields are missing");
  }

  if (basePrice <= 0) {
    throw new ApiError(400, "Base price must be positive");
  }

  if (mongoose.Types.ObjectId.isValid(pattern) || mongoose.Types.ObjectId.isValid(defaultPattern) || mongoose.Types.ObjectId.isValid(text) || mongoose.Types.ObjectId.isValid(graphic)) {
    basePrice = basePrice + 20;
  }

  if(color != "#ffffff" || color != "#FFFFFF") {
    basePrice = basePrice + 10;
  }

  const design = await Design.create({
    owner: req.user._id,
    name,
    product,
    color,
    pattern,
    defaultPattern,
    text,
    graphic,
    basePrice,
    isPublic: false, // Always private by default
  });

  return res
    .status(201)
    .json(new ApiResponse(201, design, "Design created successfully"));
});

// Get my designs
const getMyDesigns = asyncHandler(async (req, res) => {
  const {  isPublic } = req.query;
  const query = { owner: req.user._id };

  
  if (isPublic !== undefined) {
    query.isPublic = isPublic === "true";
  }

  const designs = await Design.find(query);
  return res
    .status(200)
    .json(new ApiResponse(200, designs, "Designs retrieved successfully"));
});

// Get public designs of any user by user ID
const getPublicDesignsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const designs = await Design.find({
    owner: userId,
    isPublic: true,
    status: "published",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, designs, "Public designs retrieved"));
});

// Get design by ID (owner, public, or admin)
const getDesignById = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  
  // Admins can access any design directly
  if (req.user.role === 'admin') {
    const design = await Design.findById(designId);
    if (!design) throw new ApiError(404, "Design not found");
    return res.status(200).json(new ApiResponse(200, design, "Design retrieved"));
  }

  // Regular users have restricted access
  const design = await Design.findOne({
    _id: designId,
    $or: [
      { owner: req.user._id },
      { isPublic: true },
      {  owner: req.user._id }
    ]
  });

  if (!design) {
    throw new ApiError(404, "Design not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design, "Design retrieved successfully"));
});

// Update design (owner only)
const updateDesign = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  const updateData = req.body;

  // Prevent changing certain fields directly
  if ("owner" in updateData || "_id" in updateData) {
    throw new ApiError(400, "Cannot change design ownership or ID");
  }

  const design = await Design.findOneAndUpdate(
    { _id: designId, owner: req.user._id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!design) {
    throw new ApiError(404, "Design not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design, "Design updated successfully"));
});

// Toggle design public status (owner only)
const toggleDesignPublicStatus = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  const { isPublic } = req.body;

  if (typeof isPublic !== "boolean") {
    throw new ApiError(400, "isPublic must be a boolean");
  }

  const design = await Design.findOneAndUpdate(
    { _id: designId, owner: req.user._id },
    {
      isPublic,
      // If making public, ensure it's published
      ...(isPublic && { status: "published" }),
    },
    { new: true }
  );

  if (!design) {
    throw new ApiError(404, "Design not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design, "Design public status updated"));
});


// Delete design (owner or admin)
const deleteDesign = asyncHandler(async (req, res) => {
  const { designId } = req.params;

  // Admin can delete any design, owner can delete their own
  const query =
    req.user.role === "admin"
      ? { _id: designId }
      : { _id: designId, owner: req.user._id };

  const design = await Design.findOneAndDelete(query);

  if (!design) {
    throw new ApiError(404, "Design not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Design deleted successfully"));
});

// Get all designs (admin only)
const getAllDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find().populate("owner", "username");
  return res
    .status(200)
    .json(new ApiResponse(200, designs, "All designs retrieved"));
});

// Get all public designs
const getAllPublicDesigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: "owner",
    lean: true,
  };

  const designs = await Design.paginate(
    { isPublic: true, status: "published" },
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, designs, "Public designs retrieved"));
});

export {
  createDesign,
  getMyDesigns,
  getPublicDesignsByUser,
  getDesignById,
  updateDesign,
  toggleDesignPublicStatus,
  updateDesignPurchasableStatus,
  deleteDesign,
  getAllDesigns,
  getAllPublicDesigns,
};
