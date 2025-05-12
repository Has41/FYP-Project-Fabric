import mongoose, { Schema } from "mongoose";

const pattrenSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
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

export const Pattren = mongoose.model("Pattren", pattrenSchema);