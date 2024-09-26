import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
    } = req.body;

    if (
      [fullname, username, email, password, phoneNumber, address, city].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const userExisted = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExisted) {
      throw new ApiError(409, "Email or Username already registered");
    }

    let avatarLocalPath;
    if (
      req.file &&
      Array.isArray(req.file.avatar) &&
      req.file.avatar.length > 0
    ) {
      avatarLocalPath = req.file.avatar[0].path;
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.create({
      fullname,
      email,
      password,
      phoneNumber,
      address,
      city,
      postalCode,
      username: username.toLowerCase(),
      avatar: avatar?.url || "",
    });

    const userCreated = await User.findOne({ _id: user._id }).select(
      "-password -refreshToken"
    );
    if (!userCreated) {
      throw new ApiError(500, "Server Error");
    }

    // Return the response with user data
    return res
      .status(201)
      .json(new ApiResponse(201, userCreated, "User Registered successfully."));
  } catch (error) {
    // Handle any unexpected errors
    next(error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(401, "Email or Username is Requried");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await genrateAccessTokenAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

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
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
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
  const { fullname, username, email, phoneNumber, address, city, postalCode } =
    req.body;

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

  return res.status(200).json(new ApiResponse(200, user, "Detaile Upadted"));
});

const updateUserAvtar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing on server");
  }

  const oldAvatar = req.user?.avatar;

  if (oldAvatar) {
    const public_id = oldAvatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(public_id);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(402, "File not uploaded on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Uploaded suceesfully"));
});

const userProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username Not Found");
  }

  const profile = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
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
      $project: {
        refreshToken: 0,
        password: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "profile Detail Fatched"));
});

const adminProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username Not Found");
  }

  const profile = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "pattrens",
        localField: "_id",
        foreignField: "owner",
        as: "pattrens",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "owner",
        as: "products",
      },
    },

    {
      $project: {
        refreshToken: 0,
        password: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "profile Detail Fatched"));
});

const orderHistory = asyncHandler(async (req, res) => {
  try {
    const orders = await User.aggregate([
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
                from: "products",
                localField: "products",
                foreignField: "_id",
                as: "Products",
                pipeline: [
                  {
                    $lookup: {
                      from: "categories",
                      localField: "category",
                      foreignField: "_id",
                      as: "Category",
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "designs",
                localField: "designs",
                foreignField: "_id",
                as: "Designs",
              },
            },
          ],
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders History Fetched"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching order history")); // Provide a generic error message
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
};
