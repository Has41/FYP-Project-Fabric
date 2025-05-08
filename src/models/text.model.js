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
    },
    {
        timestamps: true,
    }
);
export const Text = mongoose.model("Text", textSchema);