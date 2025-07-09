import { APIError } from "../../utils/apiError";
import { User } from "../../models/user.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";
import generateAccessAndRefreshToken from "../../services/generateAccessAndRefreshToken";

const adminRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    throw new APIError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError(400, "User already exists");
  }

  const user = new User({
    name,
    email,
    password,
    phone,
    role: "admin",
  });

  await user.save();

  res
    .status(201)
    .json(new APIResponse(201, user, "Admin registered successfully"));
});

const resetAdminPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    throw new APIError(400, "Email and new password are required");
  }
  const user = await User.findOne({ email, role: "admin" });
  if (!user) {
    throw new APIError(404, "Admin not found");
  }
  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json(new APIResponse(200, user, "Admin password reset successfully"));
});

const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new APIError(400, "Email and password are required");
  }
  const user = await User.findOne({ email, role: "admin" });

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    throw new APIError(400, "Incorrect Password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  const tokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, tokenOptions)
    .cookie("refreshToken", refreshToken, tokenOptions)
    .cookie("userId", user._id, tokenOptions)
    .json(new APIResponse(200, user, "Admin logged in successfully"));
});

const logoutAdmin = asyncHandler(async (req, res, next) => {
  const { userId } = req.cookies;
  if (!userId) {
    throw new APIError(400, "User ID is required");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new APIError(404, "User not found");
  }
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .clearCookie("userId")
    .json(new APIResponse(200, null, "Admin logged out successfully"));
});

export { adminRegister, resetAdminPassword, loginAdmin, logoutAdmin };
