import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      media_metadata: true,
    });
    console.log(`File Path : ${uploadResult.url}`);
    // file has been uploaded successfull
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (public_id)=>{
  try {
    if(!public_id) return null;
    const deleteResult = await cloudinary.uploader.destroy(public_id, function(error, result){
      if (error) {
        console.log("Error deleting file:", error);
      } else {
        console.log("File deleted successfully:", result);
      }
    })
    return deleteResult
  } catch (error) {
    console.log("Error deleting file:", error);
    return null;
  }
}

export { uploadOnCloudinary , deleteFromCloudinary};
