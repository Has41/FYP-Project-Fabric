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
    images: [
      {
        type: String,
        required: true,
      },
    ],
    images: {
      type: Array,
      validate: {
        validator: function (arr) {
          return arr.length >= 4;
        },
        message: "You must provide at least 4 images.",
      },
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    isPublic: {
      type: Boolean,
      required: true,
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
