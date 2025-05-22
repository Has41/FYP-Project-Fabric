import mongoose, { Schema } from "mongoose";

const textSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
    fontSize: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    color: {
      type: String,
      required: true,
    },
    offset: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    isFront: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
export const Text = mongoose.model("Text", textSchema);
