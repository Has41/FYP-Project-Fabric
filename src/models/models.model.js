import mongoose, { Schema } from "mongoose";

const modelSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true
    },
    model: {
      type: String,  
      required: true
    },
    public_id: {     
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Model = mongoose.model("Model", modelSchema);