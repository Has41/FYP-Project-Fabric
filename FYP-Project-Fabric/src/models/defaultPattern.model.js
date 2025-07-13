import mongoose, { Schema } from "mongoose";

const patternSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      }
    },
  },
  {
    timestamps: true,
  }
);

export const DefaultPattern = mongoose.model("DefaultPattern", patternSchema);