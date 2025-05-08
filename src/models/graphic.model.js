import mongoose, { Schema } from "mongoose";

const graphicSchema = new Schema(
    {
        image : {
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
export const Graphic = mongoose.model("Graphic", graphicSchema);