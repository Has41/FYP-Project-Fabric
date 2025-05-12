import mongoose, { Schema } from "mongoose";

const textSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        fontSize: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        offset: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 }
          },
          isFront: { type: Boolean, default: true }
        
    },
    {
        timestamps: true,
    }
);
export const Text = mongoose.model("Text", textSchema);