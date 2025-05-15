import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    role: {
      type: String,
      enum: ["user", "admin", "designer"],
      default: "user",
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    country: {
      type: String,
      default: "Pakistan"
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },

    postalCode: String,
    avatar: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
   
    refreshToken: String,
    accountDetails: {
      accountNumber: {
        type: String,
        
        validate: {
          validator: (v) => /^\d{9,18}$/.test(v),
          message: "Invalid account number",
        },
      },
      bankName: {
        type: String,
      },
      bankBranch: {
        type: String,
      },
      ifscCode: {
        type: String,

        validate: {
          validator: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v),
          message: "Invalid IFSC code",
        },
      },
      accountHolderName: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password verification method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Token generation methods
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("User", userSchema);
