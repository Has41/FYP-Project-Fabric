import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { DefaultPattern } from "../models/defaultPattern.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addPattern = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name?.trim()) {
      throw new ApiError(400, "Pattern name is required");
    }

    let files = [];
    if (req.file) {
      files = [req.file];
    } else if (req.files && Array.isArray(req.files)) {
      files = req.files;
    } else {
      throw new ApiError(400, "No file uploaded");
    }

    const createdPatterns = [];

    for (const file of files) {
      // Upload to Cloudinary
      const uploadResult = await uploadOnCloudinary(file.path);
      if (!uploadResult?.secure_url || !uploadResult?.public_id) {
        throw new ApiError(500, "Failed to upload pattern to Cloudinary");
      }

      // Create pattern document
      const pattern = await DefaultPattern.create({
        name: name.trim(),
        image: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      });

      createdPatterns.push(pattern);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdPatterns, "Pattern(s) added successfully"));

  } catch (error) {
    next(error);
  }
});

const deletePattern = asyncHandler(async (req, res, next) => {
  try {
    const { patternId } = req.params;

    // Validate pattern ID
    if (!mongoose.Types.ObjectId.isValid(patternId)) {
      throw new ApiError(400, "Invalid pattern ID format");
    }

    // Find and delete pattern
    const pattern = await DefaultPattern.findByIdAndDelete(patternId);
    if (!pattern) {
      throw new ApiError(404, "Pattern not found");
    }

    // Delete from Cloudinary using public ID
    try {
      await deleteFromCloudinary(pattern.image.publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError.message);
      // You might want to handle this differently based on requirements
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Pattern deleted successfully"));

  } catch (error) {
    next(error);
  }
});
const allPattern = asyncHandler(async (req, res, next) => {
  const patterns = await DefaultPattern.find();
  try {
    if (!patterns || patterns.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No Patterns Found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, patterns, "Fetched Patterns Successfully"));
  } catch (error) {
    next(error);
  }
});

export { addPattern, deletePattern, allPattern };
