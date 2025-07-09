import { APIError } from "../../utils/apiError";
import { APIResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../models/user.model";
import generateAccessAndRefreshToken from "../../services/generateAccessAndRefreshToken";

const loginStaff = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new APIError("Email and password are required", 400);
  }

  const user = await User.findOne({ email, role: "staff" });

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
    .json(new APIResponse(200, loggedInUser, "Admin logged in successfully"));
});

const logoutStaff = asyncHandler(async (req, res, next) => {
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

export { loginStaff, logoutStaff };
