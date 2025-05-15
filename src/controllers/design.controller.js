import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Design } from "../models/design.model.js";
import { Graphic } from "../models/graphic.model.js";
import { Text } from "../models/text.model.js";
import { Pattern } from "../models/pattern.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { DefaultPattern } from "../models/defaultPattern.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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
    basePrice,
    isPublic,
  } = req.body;
  const designerProfit = Number(req.body.designerProfit) || 0;

  let salePrice;

  // Validation
  if (!name || !product || !color || !basePrice) {
    throw new ApiError(400, "Required fields are missing");
  }

  if (basePrice <= 0) {
    throw new ApiError(400, "Base price must be positive");
  }

  if (
    mongoose.Types.ObjectId.isValid(pattern) ||
    mongoose.Types.ObjectId.isValid(defaultPattern) ||
    mongoose.Types.ObjectId.isValid(text) ||
    mongoose.Types.ObjectId.isValid(graphic)
  ) {
    salePrice = basePrice + 20;
  }

  if (color !== "#ffffff" && color !== "#FFFFFF") {
    salePrice = basePrice + 10;
  }

  if (isPublic === "true" && req.user.role === "user") {
    throw new ApiError(403, "Be a Designer for Public Designs");
  }

  if (req.user.role === "admin") {
    throw new ApiError(
      403,
      "You are an admin, you should add a product or model?"
    );
  }
  if (!req.file?.path) {
    throw new ApiError(400, "Image file is required");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  if (!uploadResult?.secure_url || !uploadResult?.public_id) {
    throw new ApiError(500, "Failed to upload pattern to Cloudinary");
  }

  const design = await Design.create({
    owner: req.user._id,
    name,
    product,
    color,
    pattern: pattern === "" ? null : pattern,
    defaultPattern: defaultPattern === "" ? null : defaultPattern,
    text, // Expecting an array of ObjectId references
    graphic, // Expecting an array of ObjectId references
    designerProfit,
    basePrice,
    salePrice,
    isPublic: isPublic || false,
    image: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  });

  if (!design) {
    throw new ApiError(500, "Failed to create design");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, design, "Design created successfully"));
});


// Get my designs
const getMyDesigns = asyncHandler(async (req, res) => {
  const { isPublic } = req.query;
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
  if (req.user.role === "admin") {
    const design = await Design.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(designId) } },

      // Lookup for User to get username and fullname
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          username: "$ownerDetails.username",
          fullname: "$ownerDetails.fullname",
        },
      },

      // Lookup for Product to get title, category, price, and model type
      {
        $lookup: {
          from: "products", // Assuming your Product model's collection name is "products"
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          productTitle: "$productDetails.title",
          productCategory: "$productDetails.category",
          productPrice: "$productDetails.price",
          productModelType: "$productDetails.modelType",
        },
      },

      // Lookup for Pattern to get name and image
      {
        $lookup: {
          from: "patterns",
          localField: "pattern",
          foreignField: "_id",
          as: "patternDetails",
        },
      },

      // Lookup for DefaultPattern to get name and image
      {
        $lookup: {
          from: "defaultPatterns",
          localField: "defaultPattern",
          foreignField: "_id",
          as: "defaultPatternDetails",
        },
      },

      // Lookup for Text to get necessary fields
      {
        $lookup: {
          from: "texts",
          localField: "text",
          foreignField: "_id",
          as: "textDetails",
        },
      },

      // Lookup for Graphic to get necessary fields
      {
        $lookup: {
          from: "graphics",
          localField: "graphic",
          foreignField: "_id",
          as: "graphicDetails",
        },
      },

      {
        $project: {
          owner: 1,
          image: 1,
          name: 1,
          product: 1,
          color: 1,
          pattern: 1,
          defaultPattern: 1,
          textDetails: 1,
          graphicDetails: 1,
          basePrice: 1,
          salePrice: 1,
          designerProfit: 1,
          status: 1,
          username: 1,
          fullname: 1,
          productTitle: 1,
          productCategory: 1,
          productPrice: 1,
          productModelType: 1,
          defaultPatternDetails: 1,
          patternDetails: 1,
        },
      },
    ]);

    if (!design || design.length === 0) {
      throw new ApiError(404, "Design not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, design[0], "Design retrieved"));
  }

  // Regular users have restricted access
  const design = await Design.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(designId),
        $or: [{ owner: req.user._id }, { isPublic: true }],
      },
    },

    // Lookup for User to get username and fullname
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        username: "$ownerDetails.username",
        fullname: "$ownerDetails.fullname",
      },
    },

    // Lookup for Product to get title, category, price, and model type
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        productTitle: "$productDetails.title",
        productCategory: "$productDetails.category",
        productPrice: "$productDetails.price",
        productModelType: "$productDetails.modelType",
      },
    },

    // Lookup for Pattern to get name and image
    {
      $lookup: {
        from: "patterns",
        localField: "pattern",
        foreignField: "_id",
        as: "patternDetails",
      },
    },
    // {
    //   $unwind: { path: "$patternDetails", preserveNullAndEmptyArrays: true },
    // },
    // {
    //   $addFields: {
    //     patternName: "$patternDetails.name",
    //     patternImage: "$patternDetails.image",
    //   },
    // },

    // Lookup for DefaultPattern to get name and image
    {
      $lookup: {
        from: "defaultPatterns",
        localField: "defaultPattern",
        foreignField: "_id",
        as: "defaultPatternDetails",
      },
    },
    // {
    //   $unwind: {
    //     path: "$defaultPatternDetails",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $addFields: {
    //     defaultPatternName: "$defaultPatternDetails.name",
    //     defaultPatternImage: "$defaultPatternDetails.image",
    //   },
    // },

    // Lookup for Text to get necessary fields
    {
      $lookup: {
        from: "texts",
        localField: "text",
        foreignField: "_id",
        as: "textDetails",
      },
    },

    // Lookup for Graphic to get necessary fields
    {
      $lookup: {
        from: "graphics",
        localField: "graphic",
        foreignField: "_id",
        as: "graphicDetails",
      },
    },

    {
      $project: {
        owner: 1,
        name: 1,
        product: 1,
        image: 1,
        color: 1,
        pattern: 1,
        defaultPattern: 1,
        textDetails: 1,
        graphicDetails: 1,
        basePrice: 1,
        salePrice: 1,
        designerProfit: 1,
        status: 1,
        username: 1,
        fullname: 1,
        productTitle: 1,
        productCategory: 1,
        productPrice: 1,
        productModelType: 1,
        // patternName: 1,
        // patternImage: 1,
        // defaultPatternName: 1,
        // defaultPatternImage: 1,
        defaultPatternDetails: 1,
        patternDetails: 1,
      },
    },
  ]);

  if (!design || design.length === 0) {
    throw new ApiError(404, "Design not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design[0], "Design retrieved successfully"));
});

const getDesignByIdSimple = asyncHandler(async (req, res) => {
  const { designId } = req.params;

  // Admins can access any design directly
  if (req.user.role === "admin") {
    const design = await Design.findById(designId)
      .populate("text")
      .populate("graphic")
      .populate("pattern")
      .populate("defaultPattern")  // Fixed typo from 'defaultpattern' to 'defaultPattern'
      .populate('owner')
      .populate('product');

    if (!design) throw new ApiError(404, "Design not found");
    return res
      .status(200)
      .json(new ApiResponse(200, design, "Design retrieved"));
  }

  // Regular users have restricted access
  const design = await Design.findOne({
    _id: designId,
    $or: [{ owner: req.user._id }, { isPublic: true }],
  })
    .populate("text")
    .populate("graphic")
    .populate({
      path: "pattern",
      model: "Pattern"  
    })
    .populate({
      path: "defaultPattern",
      model: "DefaultPattern"  
    })
    .populate('owner')
    .populate('product');

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

  // Check if text and graphic are arrays and add the new elements to the design
  if (updateData.text && !Array.isArray(updateData.text)) {
    throw new ApiError(400, "Text must be an array of object IDs");
  }

  if (updateData.graphic && !Array.isArray(updateData.graphic)) {
    throw new ApiError(400, "Graphic must be an array of object IDs");
  }
  if (!req.file?.path) {
    throw new ApiError(400, "Image file is required");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult?.secure_url || !uploadResult?.public_id) {
      throw new ApiError(500, "Failed to upload pattern to Cloudinary");
    }

    updateData.image = uploadResult.secure_url;
    updateData.imagePublicId = uploadResult.public_id;

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

const pushText = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  const { text } = req.body;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(designId)) {
    throw new ApiError(400, "Invalid design ID");
  }

  if (!text || !mongoose.Types.ObjectId.isValid(text)) {
    throw new ApiError(400, "Valid text ID is required");
  }

  const design = await Design.findByIdAndUpdate(
    designId,  // Just pass the ID directly
    { $push: { text } },
    { new: true }
  );

  if (!design) {
    throw new ApiError(404, "Design not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design, "Text added successfully"));
});

const pushGraphic = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  const { graphic } = req.body;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(designId)) {
    throw new ApiError(400, "Invalid design ID");
  }

  if (!graphic || !mongoose.Types.ObjectId.isValid(graphic)) {
    throw new ApiError(400, "Valid graphic ID is required");
  }

  const design = await Design.findByIdAndUpdate(
    designId,  // Just pass the ID directly
    { $push: { graphic } },
    { new: true }
  );

  if (!design) {
    throw new ApiError(404, "Design not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design, "Graphic added successfully"));  
  
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
  try {
    await deleteFromCloudinary(design.image.publicId);
  } catch (cloudinaryError) {
    console.error("Cloudinary deletion error:", cloudinaryError.message);
    // Consider whether to proceed or throw error based on your requirements
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
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    // Configure options with less restrictive population
    const options = {
      page: pageNumber,
      limit: limitNumber,
      sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
      populate: [
        {
          path: "owner",
          select: "username avatar fullname",
          model: User,
        },
        {
          path: "product",
          model: Product,
          select: "title price discount_price type",
        },
        {
          path: "text",
          model: Text,
          options: { strictPopulate: false }, // Allow missing texts
        },
        {
          path: "graphic",
          model: Graphic,
          options: { strictPopulate: false }, // Allow missing graphics
        },
        {
          path: "pattern",
          model: Pattern,
          options: { strictPopulate: false }, // Allow missing patterns
        },
        {
          path: "defaultPattern",
          model: DefaultPattern,
          options: { strictPopulate: false }, // Allow missing default patterns
        },
      ],
      lean: true,
    };

    // Less restrictive query - only check isPublic and status
    const designs = await Design.paginate(
      {
        isPublic: true,
        status: "published",
      },
      options
    );

    // Format response safely
    const formattedDesigns = {
      ...designs,
      docs: designs.docs.map((design) => ({
        ...design,
        currentPrice:
          design.product?.discount_price ?? design.product?.price ?? 0,
        originalPrice: design.product?.price ?? 0,
        hasDiscount:
          design.product?.discount_price &&
          design.product.discount_price < design.product.price,
      })),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedDesigns,
          "Public designs retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching public designs:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, "Validation error: " + error.message);
    }
    if (error.name === "CastError") {
      throw new ApiError(400, "Invalid ID format");
    }

    throw new ApiError(
      500,
      error.message || "Failed to retrieve public designs"
    );
  }
});

export {
  createDesign,
  getMyDesigns,
  getPublicDesignsByUser,
  getDesignById,
  updateDesign,
  toggleDesignPublicStatus,
  deleteDesign,
  getAllDesigns,
  getAllPublicDesigns,
  getDesignByIdSimple,
  pushText,
  pushGraphic
};
