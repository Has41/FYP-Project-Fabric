import mongoose, { Schema } from "mongoose";

const colorSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);
export const Color = mongoose.model("Color", colorSchema);