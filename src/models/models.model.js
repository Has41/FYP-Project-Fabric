import mongoose, { Schema } from "mongoose";

const modelSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true
    },
    model: {
      type: String,  // Cloudinary URL
      required: true
    },
    public_id: {     // Only additional field you really need
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Model = mongoose.model("Model", modelSchema);