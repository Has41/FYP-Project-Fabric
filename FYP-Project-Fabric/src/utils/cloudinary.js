import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Robust configuration with timeout
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 600000, // 60 seconds
});

// Determine the resource type based on file extension
const determineResourceType = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  if (['glb', 'gltf'].includes(ext)) {
    return 'raw'; // For 3D models
  } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
    return 'image'; // For images (if you need to support them)
  }
  return 'auto'; // Default for other file types (Cloudinary auto-detection)
};

// Function to upload file to Cloudinary
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      throw new ApiError(400, "File does not exist at the specified path");
    }

    // Log file upload details
    const resourceType = determineResourceType(localFilePath);
    console.log(`Uploading ${localFilePath} as resource type: ${resourceType}`);
    console.log(`File size: ${fs.statSync(localFilePath).size} bytes`);

    const uploadOptions = {
      resource_type: resourceType,
      folder: "3d_models", // Or change folder name depending on type
      use_filename: true,
      unique_filename: false,
      overwrite: true
    };

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, uploadOptions);

    // Cleanup: delete local file after successful upload
    fs.unlinkSync(localFilePath);
    console.log(`Upload successful: ${result.secure_url}`);
    
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    // Attempt cleanup if file exists during error
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
  }
};

// Function to delete file from Cloudinary by publicId
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new ApiError(400, "Public ID is required");

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image' // Important for 3D models, adjust if needed
    });

    if (result.result !== 'ok') {
      console.error(`Cloudinary delete failed for publicId: ${publicId}`);
      throw new ApiError(404, "File not found on Cloudinary");
    }

    console.log(`Cloudinary delete successful for publicId: ${publicId}`);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new ApiError(500, `Failed to delete from Cloudinary: ${error.message}`);
  }
};
