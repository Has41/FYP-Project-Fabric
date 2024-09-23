import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.objectId,
      ref: "User",
    },
    product: {
      type: Schema.Types.objectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);

export const Schema = mongoose.model("Schema", commentSchema);
