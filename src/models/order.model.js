import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
  design: {
    type: Schema.Types.ObjectId,
    ref: "Design",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  designerProfit: {
    type: Number,
    default: 0,
    min: 0,
  },
  isPublicDesign: {
    type: Boolean,
    default: false,
  },
});

const orderSchema = new Schema(
  {
    orderBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    designs: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 3,
    },
    shippingAddress:{
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ["COD", "online"],
      default: "COD",
    },
    deliveryStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending",
    },
    deliveredDate: Date,
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnInfo: {
      type: Schema.Types.ObjectId,
      ref: "ReturnOrder",
    },
    designerEarningsRecorded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for optimized queries
orderSchema.index({ orderBy: 1 });
orderSchema.index({ "designs.design": 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ deliveryStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for return eligibility
orderSchema.virtual("isReturnEligible").get(function () {
  if (this.deliveryStatus !== "delivered") return false;
  const daysSinceDelivery =
    (new Date() - this.deliveredDate) / (1000 * 60 * 60 * 24);
  return daysSinceDelivery <= 3; // 3-day return window
});

export const Order = mongoose.model("Order", orderSchema);
