import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const designSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    image: {
      url: {
        type: String,
        required: true,
        trim: true,
      },
      publicId: {
        type: String,
        required: true,
        trim: true,
      }
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    color: {
      type: String,
      required: true,
    },
    pattern: {
      type: Schema.Types.ObjectId,
      ref: "Pattern",
    },
    defaultPattern: {
      type: Schema.Types.ObjectId,
      ref: "DefaultPattern",
    },
    text: [
      {
        type: Schema.Types.ObjectId,
        ref: "Text",
      },
    ],
    graphic: [
      {
        type: Schema.Types.ObjectId,
        ref: "Graphic",
      },
    ],
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    designerProfit: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
designSchema.index({ owner: 1 });
designSchema.index({ isPublic: 1 });

// Set salePrice automatically for purchasable designs
designSchema.pre("save", function (next) {
  if (!this.salePrice) {
    this.salePrice = this.basePrice;
  }
  next();
});
designSchema.set('strictPopulate', false); // ❌ Avoid unless necessary

designSchema.plugin(mongoosePaginate);

export const Design = mongoose.model("Design", designSchema);
