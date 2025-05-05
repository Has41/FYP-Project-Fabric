
import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    designs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Design",
      },
    ],
    totalAmount: {
      type: Number, // Sum of price of design price
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum : ["Cash on Delivery", "Paid"]
    },
    deliveryStatus: {
      type: String,
      required: true,
      enum : ["pending", "shipped", "delivered"]
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
