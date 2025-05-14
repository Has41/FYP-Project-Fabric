import mongoose, { Schema } from "mongoose";

const graphicSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    graphic: {
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
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
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

export const Graphic = mongoose.model("Graphic", graphicSchema);