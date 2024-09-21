import mongoose, { Schema } from "mongoose";

const pattrenSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Pattren = mongoose.model("Pattren", pattrenSchema);
