import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { count } from "console";
//import { log } from "console";

const genrateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const {
      fullname,
      username,
      email,
      password,
      phoneNumber,
      address,
      city,
      postalCode,
      role,
    } = req.body;

    if (
      [
        fullname,
        username,
        email,
        password,
        phoneNumber,
        address,
        city,
        role
      ].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const userExisted = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExisted) {
      throw new ApiError(409, "Email or Username already registered");
    }

    let avatarLocalPath, avatar;
    if (req.file && req.file.path) {
      avatarLocalPath = req.file.path;
      avatar = await uploadOnCloudinary(avatarLocalPath);
      console.log(avatar.public_id);
    }

    const user = await User.create({
      fullname,
      email,
      password,
      phoneNumber,
      address,
      city,
      postalCode,
      username: username.toLowerCase(),
      avatar:{
        url: avatar?.url || "",
        publicId: avatar?.public_id,
      },
      role,
      
    });

    const userCreated = await User.findOne({ _id: user._id }).select(
      "-password -refreshToken"
    );
    if (!userCreated) {
      throw new ApiError(500, "Server Error");
    }

    // const otp = crypto.randomBytes(3).toString("hex"); // 6-digit OTP
    // const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // user.emailVerificationToken = otp;
    // user.emailVerificationExpires = otpExpires;

    // await user.save({ validateBeforeSave: false });

    // const transporter = nodemailer.createTransport({
    //   service: "gmail", // Or any other email provider
    //   auth: {
    //     user: process.env.EMAIL_USER, // Your email address
    //     pass: process.env.EMAIL_PASS, // Your email password
    //   },
    // });

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: "Email Verification",
    //   text: `Your OTP code for email verification is ${otp}. It will expire in 10 minutes.`,
    // };

    // await transporter.sendMail(mailOptions);

    // Return the response with user data
    return res
      .status(201)
      .json(new ApiResponse(201, userCreated, "User Registered successfully."));
  } catch (error) {
    // Handle any unexpected errors
    next(error);
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Check if email and OTP are provided
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Check if OTP is valid
  if (
    user.emailVerificationToken !== otp ||
    user.emailVerificationExpires < Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validate input
  if (!email && !username) {
    throw new ApiError(401, "Email or Username is required");
  }

  // Find user by email or username
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await genrateAccessTokenAndRefreshToken(
    user._id
  );

  // Retrieve user details without sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  // Send response with tokens and user details
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Remove the refreshToken from the database
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 },
      },
      {
        new: true,
      }
    );

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    // Clear cookies and send response
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    throw new ApiError(500, "Server error occurred", error);
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    // Delete user from database
    await User.findByIdAndDelete(req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Server error occurred");
  }
});

const deleteUserByIdAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      console.log("User not found");
      throw new ApiError(404, "User not found");
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar?.publicId) {
      console.log(`Attempting to delete from Cloudinary: ${user.avatar.publicId}`);
      await deleteFromCloudinary(user.avatar.publicId);
    }

    // Delete user from database
    const deletedUser = await User.findByIdAndDelete(req.params.userId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedUser || {}, "User deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Server error occurred");
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(402, "No Refresh Token found");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const { accessToken, newRefreshToken } =
      await genrateAccessTokenAndRefreshToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

const currentPasswordChange = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "Fill all Fields");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User Not Found");
  }

  const checkPassword = await user.isPasswordCorrect(oldPassword);

  if (!checkPassword) {
    throw new ApiError(401, "User Not Found");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {
    fullname,
    username,
    email,
    phoneNumber,
    address,
    city,
    postalCode,
  } = req.body;

  if (
    [fullname, username, email, phoneNumber, address, city].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        username,
        email,
        phoneNumber,
        address,
        city,
        postalCode: postalCode || "",
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "Detaile Upadted"));
});

const updateUserAvtar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing on server");
  }

  const oldAvatar = req.user?.avatar;

  if (oldAvatar) {
   
    await deleteFromCloudinary(oldAvatar.publicId);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(402, "File not uploaded on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar:{
          url: avatar.secure_url,
          publicId: avatar.publicId
        }
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Uploaded suceesfully"));
});

const getDesignerBankInfo = asyncHandler(async (req, res) => {
  // Extract the bank info from the user document
  const bankInfo = {
    accountNumber: req.user.accountDetails.accountNumber,
    bankName: req.user.accountDetails.bankName,
    bankBranch: req.user.accountDetails.bankBranch,
    ifscCode: req.user.accountDetails.ifscCode,
    accountHolderName: req.user.accountDetails.accountHolderName,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, bankInfo, "Designer bank info fetched successfully")
    );
});

const getUserBankInfoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Authorization check - user can only view their own bank info unless they're admin
  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    throw new ApiError(403, "You can only view your own bank information");
  }

  // Fetch user with only necessary fields
  const user = await User.findById(id).select(
    "role accountDetails username email"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.accountDetails) {
    throw new ApiError(404, "Bank details not found for this user");
  }

  // Prepare response data
  const responseData = {
    userInfo: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    bankInfo: {
      accountNumber: user.accountDetails.accountNumber,
      bankName: user.accountDetails.bankName,
      bankBranch: user.accountDetails.bankBranch,
      ifscCode: user.accountDetails.ifscCode,
      accountHolderName: user.accountDetails.accountHolderName,
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseData,
        "Bank information retrieved successfully"
      )
    );
});

const addBankInfo = asyncHandler(async (req, res) => {
  const { accountNumber, bankName, bankBranch, ifscCode, accountHolderName } =
    req.body;

  // Validate required fields
  if (!accountNumber || !ifscCode || !accountHolderName) {
    throw new ApiError(
      400,
      "Account number, IFSC code, and account holder name are required"
    );
  }

  // Validate account number format (9-18 digits)
  if (!/^\d{9,18}$/.test(accountNumber)) {
    throw new ApiError(400, "Invalid account number (must be 9-18 digits)");
  }

  // Validate IFSC code format
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    throw new ApiError(400, "Invalid IFSC code format");
  }

  // Find and update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        accountDetails: {
          accountNumber,
          bankName: bankName || null,
          bankBranch: bankBranch || null,
          ifscCode,
          accountHolderName,
        },
      },
    },
    { new: true, select: "accountDetails role username email" }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
        },
        bankInfo: updatedUser.accountDetails,
      },
      "Bank information updated successfully"
    )
  );
});

const updateBankInfo = asyncHandler(async (req, res) => {
  const { 
    accountNumber, 
    bankName, 
    bankBranch, 
    ifscCode, 
    accountHolderName 
  } = req.body;

  // Validate required fields
  if (!accountNumber || !ifscCode || !accountHolderName) {
    throw new ApiError(400, "Account number, IFSC code, and account holder name are required");
  }

  // Validate account number format
  if (!/^\d{9,18}$/.test(accountNumber)) {
    throw new ApiError(400, "Account number must be 9-18 digits");
  }

  // Validate IFSC code format
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    throw new ApiError(400, "Invalid IFSC code format");
  }

  // Update bank info for the current user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        accountDetails: {
          accountNumber,
          bankName: bankName || null,
          bankBranch: bankBranch || null,
          ifscCode,
          accountHolderName
        }
      }
    },
    { 
      new: true,
      select: 'accountDetails role username email' // Return only necessary fields
    }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        },
        bankInfo: updatedUser.accountDetails
      },
      "Bank information updated successfully"
    )
  );
});

const changeRole = asyncHandler(async (req, res) => {
  const { role, accountDetails } = req.body;
  const userId = req.user._id; // User can only change their own role

  // 1. Block invalid role assignments
  if (role === "admin") {
    throw new ApiError(400, "Cannot self-assign admin role");
  }

  // 2. Validate allowed roles (only user ↔ designer)
  if (!["user", "designer"].includes(role)) {
    throw new ApiError(400, "Role can only be 'user' or 'designer'");
  }

  // 3. Special validation for designer role
  if (role === "designer") {
    if (!accountDetails?.accountNumber || 
        !accountDetails?.ifscCode || 
        !accountDetails?.accountHolderName) {
      throw new ApiError(400, "Account details required for designer role");
    }

    // Validate bank details format
    if (!/^\d{9,18}$/.test(accountDetails.accountNumber)) {
      throw new ApiError(400, "Account number must be 9-18 digits");
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(accountDetails.ifscCode)) {
      throw new ApiError(400, "Invalid IFSC code format");
    }
  }

  // 4. Prepare update (keep existing bank details if not provided)
  const updateData = { role };
  if (role === "designer") {
    updateData.accountDetails = accountDetails;
  } 
  // No else clause - retain existing accountDetails when switching to 'user'

  // 5. Update role (and bank details if becoming designer)
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { 
      new: true,
      select: 'username email role accountDetails' // Safe fields only
    }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Role updated successfully")
  );
});

const userProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const profile = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "designs",
        localField: "_id",
        foreignField: "owner",
        as: "designs",
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "orderBy",
        as: "orders",
      },
    },
    {
      $addFields: {
        totalOrders: { $size: "$orders" },
        orderIds: {
          $map: {
            input: "$orders",
            as: "order",
            in: "$$order._id",
          },
        },
      },
    },
    {
      $lookup: {
        from: "returnorders",
        let: { userOrderIds: "$orderIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$order", "$$userOrderIds"],
              },
            },
          },
        ],
        as: "returnOrders",
      },
    },
    {
      $addFields: {
        totalReturnOrders: { $size: "$returnOrders" },
      },
    },
    {
      $project: {
        refreshToken: 0,
        password: 0,
        orders: 0,
        returnOrders: 0,
        orderIds: 0,
      },
    },
  ]);

  if (!profile || profile.length === 0) {
    throw new ApiError(404, "User profile not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, profile[0], "User profile fetched successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  // Check if the requesting user is an admin
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Only admin can access all users");
  }

  const { page = 1, limit = 10 } = req.query;

  const users = await User.aggregate([
    {
      $lookup: {
        from: "designs",
        localField: "_id",
        foreignField: "owner",
        as: "designs",
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "orderBy",
        as: "orders",
      },
    },
    {
      $addFields: {
        designsCount: { $size: "$designs" },
        ordersCount: { $size: "$orders" },
      },
    },
    {
      $project: {
        refreshToken: 0,
        password: 0,
        designs: 0,
        orders: 0,
      },
    },
    {
      $sort: { createdAt: -1 }, // Sort by newest first
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

const getUserDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      {
        $match: { 
          orderBy: new mongoose.Types.ObjectId(userId),
          deliveryStatus: { $nin: ["cancelled", "returned"] } // Exclude cancelled and returned orders
        }
      },
      {
        $group: {
          _id: "$orderStatus",
          totalSpent: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Format status breakdown
    const statusCounts = stats.reduce(
      (acc, item) => {
        acc.totalOrders += item.totalOrders;
        acc.totalSpent += item.totalSpent;
        acc.statusBreakdown[item._id] = item.totalOrders;
        return acc;
      },
      { totalOrders: 0, totalSpent: 0, statusBreakdown: {} }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          statusCounts,
          "User dashboard stats fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error in getUserDashboardStats:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          error.message || "Internal server error"
        )
      );
  }
});

const adminProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username Not Found");
  }

  const profile = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "defaultpattrens",
        localField: "_id",
        foreignField: "owner",
        as: "pattrens",
      },
    },
    {
      $lookup: {
        from: "products", // ✅ fixed typo
        localField: "_id",
        foreignField: "owner",
        as: "products",
        // Optional: remove the inner pipeline unless using MongoDB 5+ with $lookup + let/expr
      },
    },
    {
      $project: {
        refreshToken: 0,
        password: 0,
      },
    },
  ]);

  if (!profile || profile.length === 0) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile[0], "Profile details fetched"));
});

const orderHistory = asyncHandler(async (req, res) => {
  try {
    const userOrders = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "orderBy",
          as: "ordersHistory",
          pipeline: [
            {
              $lookup: {
                from: "designs",
                let: { designIds: "$designs" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$designIds"] },
                    },
                  },
                  // Optional nested lookups inside each design:
                  {
                    $lookup: {
                      from: "users",
                      localField: "owner",
                      foreignField: "_id",
                      as: "Owner",
                    },
                  },
                ],
                as: "Designs",
              },
            },
          ],
        },
      },
      {
        $project: {
          ordersHistory: 1,
          _id: 0,
        },
      },
    ]);

    const orders = userOrders[0]?.ordersHistory || [];

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders History Fetched"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching order history"));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  currentPasswordChange,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvtar,
  userProfile,
  adminProfile,
  orderHistory,
  verifyEmail,
  changeRole,
  getDesignerBankInfo,
  getUserDashboardStats,
  deleteUserById,
  deleteUserByIdAdmin,
  getAllUsers,
  getUserBankInfoById,
  addBankInfo,
  updateBankInfo
};
