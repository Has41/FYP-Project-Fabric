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

    // Upload the file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      media_metadata: true,
    });

    console.log(`File Path : ${uploadResult.url}`);

    // Check if the file exists before deleting
    if (fs.existsSync(localFilePath)) {
     fs.unlinkSync(localFilePath);
    }

    // Return the upload result
    return uploadResult;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    // Attempt to delete the file if it exists, even if an error occurs
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // Return null in case of error
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
