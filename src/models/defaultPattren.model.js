import mongoose, { Schema } from "mongoose";

const pattrenSchema = new Schema(
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

export const DefaultPattren = mongoose.model("DefaultPattren", pattrenSchema);