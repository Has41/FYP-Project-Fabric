import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcript from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
      
      lowercase: true,
      trim: true,
      index: true,
    },

    // Existing fields...
    isEmailVerified: {
      type: Boolean,
      default: false, // By default, email is not verified
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date, // Expiration date for OTP
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      require: [true, "Please Enter Password"],
    },
    phoneNumber: {
      type: String,
      require: [true, "Please Enter Phone Number"],
    },
    address: {
      type: String,
      require: [true, "Please Enter Address"],
    },
    city: {
      type: String,
      require: [true, "Please Enter City Name"],
    },
    postalCode: {
      type: String,
    },
    avatar: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcript.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcript.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        fullname: this.fullname,
        email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
};


userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);
