import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Design } from "../models/design.model";
import { ApiResponse } from "../utils/ApiResponse";

const addDesign = asyncHandler(async (req, res, next) => {
  const {
    name,
    price,
    product,
    isPublic = false,
    color,
    pattren,
    defaultPattren,
    text,
    graphic,
  } = req.body;
  const owner = req.user._id; // Use req.user._id instead of user._id

  // Validation
  if (!name || !price || !product || !color) {
    throw new ApiError(400, "Name, Color, Product and Price are required");
  }
  if (price <= 0) {
    throw new ApiError(400, "Price must be a positive number");
  }

  try {
    const design = new Design({
      name,
      product,
      isPublic,
      color,
      pattren,
      defaultPattren,
      text,
      graphic,
      owner,
    });

    await design.save();
    return res
      .status(200)
      .json(new ApiResponse(200, design, "Design added successfully"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const allDesign = asyncHandler(async (req, res, next) => {
  const designs = await Design.find().lean();

  try {
    if (!designs || designs.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Designs Found"));
    }
    return res.status(200).json(new ApiResponse(200, designs, "Designs Found"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const designById = asyncHandler(async (req, res) => {
  const { designId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(designId)) {
    throw new ApiError(400, "Invalid design ID");
  }

  const design = await Design.findById(designId);

  if (!design) {
    throw new ApiError(404, "Design not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, design, "Design retrieved successfully"));
});

const publicDesign = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    where: { isPublic: true },
  };

  const designs = await Design.paginate({ isPublic: true }, options);

  if (!designs.docs || designs.docs.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { results: [], total: 0 },
          "No public designs found"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, designs, "Public designs retrieved successfully")
    );
});

const publicDesignById = asyncHandler(async (req, res, next) => {
  const { designId } = req.params;
  if (!designId) {
    throw new ApiError(400, "Design Id Not Found");
  }
  const design = await Design.find({ _id: designId, isPublic: true });
  if (!design) {
    throw new ApiError(404, "Design Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, design, "Design Found Successfully"));
});

const publicDesignByUserId = asyncHandler(async (req, res, next) => {
  const designs = await Design.find({ owner: req.user._id, isPublic: true });
  try {
    if (!designs || designs.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Designs Found"));
    }
    return res.status(200).json(new ApiResponse(200, designs, "Designs Found"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const privateDesignByUserId = asyncHandler(async (req, res, next) => {
  const designs = await Design.find({ owner: req.user._id, isPublic: false });
  try {
    if (!designs || designs.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Designs Found"));
    }
    return res.status(200).json(new ApiResponse(200, designs, "Designs Found"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const designByUserId = asyncHandler(async (req, res, next) => {
  const designs = await Design.find({ owner: req.user._id });
  try {
    if (!designs || designs.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Designs Found"));
    }
    return res.status(200).json(new ApiResponse(200, designs, "Designs Found"));
  } catch (error) {
    next(error);
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});

const updateDesign = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(designId)) {
    throw new ApiError(400, "Invalid design ID");
  }

  if (!updateData.name || !updateData.price) {
    throw new ApiError(400, "Name and price are required");
  }

  const design = await Design.findOne({ _id: designId, owner: req.user._id });
  if (!design) {
    throw new ApiError(404, "Design not found or you don't have permission");
  }

  const updatedDesign = await Design.findByIdAndUpdate(
    designId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDesign, "Design updated successfully"));
});

const deleteDesign = asyncHandler(async (req, res, next) => {
  const { designId } = req.params;
  if (!designId) {
    throw new ApiError(400, "Design Id Not Found");
  }
  const design = await Design.findById(designId);
  if (!design) {
    throw new ApiError(404, "Design Not Found");
  }
  await Design.findByIdAndDelete(designId);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Design Deleted Successfully"));
});

export {
  addDesign,
  allDesign,
  designById,
  publicDesign,
  publicDesignById,
  publicDesignByUserId,
  designByUserId,
  privateDesignByUserId,
  updateDesign,
  deleteDesign,
};
