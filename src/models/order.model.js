import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    designs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Design",
      },
    ],
    price: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    deliveryStatus: {
        type: String,
        required: true
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
