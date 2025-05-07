import mongoose, { Schema } from "mongoose";

const designerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountDetails: {
      accountNumber: {
        type: String,
        required: true,
        validate: {
          validator: (v) => /^\d{9,18}$/.test(v),
          message: "Invalid account number",
        },
      },
      bankName: {
        type: String,
        required: true,
      },
      bankBranch: {
        type: String,
        required: true,
      },
      ifscCode: {
        type: String,
        required: true,
        validate: {
          validator: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v),
          message: "Invalid IFSC code",
        },
      },
      accountHolderName: {
        type: String,
        required: true,
      },
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    designs: [{
      type: Schema.Types.ObjectId,
      ref: "Design",
    }],
    sales: [{
      type: Schema.Types.ObjectId,
      ref: "Order",
    }],
    payoutHistory: [{
      amount: Number,
      date: Date,
      status: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: "pending",
      },
      reference: String,
    }],
  },
  { timestamps: true }
);

// Indexes
designerSchema.index({ user: 1 });
designerSchema.index({ "accountDetails.accountNumber": 1 }, { unique: true });

export const Designer = mongoose.model("Designer", designerSchema);