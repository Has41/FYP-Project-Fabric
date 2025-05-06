import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const designSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    name: {
      type: String,
      required: true,
      index: "text"
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    color: {
      type: String,
      requried: true // Keeping typo (should be "required")
    },
    pattren: { // Keeping original spelling
      type: Schema.Types.ObjectId,
      ref: "Pattren" // Keeping original spelling
    },
    defaultPattren: { // Keeping original spelling
      type: Schema.Types.ObjectId,
      ref: "DefaultPattren" // Keeping original spelling
    },
    text: {
      type: Schema.Types.ObjectId,
      ref: "Text"
    },
    graphic: {
      type: Schema.Types.ObjectId,
      ref: "Graphic"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
designSchema.index({ owner: 1, isPublic: 1 });
designSchema.index({ createdAt: -1 });

// Pagination plugin
designSchema.plugin(mongoosePaginate);

export const Design = mongoose.model("Design", designSchema);