import mongoose, { Schema } from "mongoose";

const pattrenSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
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

export const Pattren = mongoose.model("Pattren", pattrenSchema);
