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

const determineResourceType = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  return ext === 'glb' || ext === 'gltf' ? 'raw' : 'auto';
};

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      throw new ApiError(400, "File does not exist at the specified path");
    }

    const resourceType = determineResourceType(localFilePath);
    console.log(`Uploading ${localFilePath} as resource type: ${resourceType}`);

    const uploadOptions = {
      resource_type: resourceType,
      folder: "3d_models",
      use_filename: true,
      unique_filename: false,
      overwrite: true
    };

    const result = await cloudinary.uploader.upload(localFilePath, uploadOptions);
    
    // Cleanup
    fs.unlinkSync(localFilePath);
    console.log(`Upload successful: ${result.secure_url}`);
    
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    // Attempt cleanup if file exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new ApiError(400, "Public ID is required");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw' // Important for 3D models
    });

    if (result.result !== 'ok') {
      throw new ApiError(404, "File not found on Cloudinary");
    }

    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new ApiError(500, `Failed to delete from Cloudinary: ${error.message}`);
  }
};