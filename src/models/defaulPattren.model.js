import mongoose, { Schema } from "mongoose";

const pattrenSchema = new Schema(
  {
    
    name:{
      type : String,
      required : true
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Pattren = mongoose.model("DefaultPattren", pattrenSchema);
