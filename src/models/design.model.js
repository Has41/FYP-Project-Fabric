import mongoose, { Schema } from "mongoose";

const designSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    isPublic: {
      type: Boolean,
      required: false,
    },
    color: {
      type: String,
      requried: true,
    },
    pattren: {
      type: Schema.Types.ObjectId,
      ref: "Pattren",
    },
    defaultPattren: {
      type: Schema.Types.ObjectId,
      ref: "DefaultPattren",
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Design = mongoose.model("Design", designSchema);
