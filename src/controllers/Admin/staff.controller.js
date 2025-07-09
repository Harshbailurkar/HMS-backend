import { APIError } from "../../utils/apiError";
import { User } from "../../models/user.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";

const staffRegister = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }

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
    role: "staff",
  });

  await user.save();

  res
    .status(201)
    .json(new APIResponse(201, user, "Staff registered successfully"));
});

const updateStaffInfo = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { staffId } = req.params;
  const { name, email, phone, password } = req.body;
  if (!staffId) {
    throw new APIError(400, "Staff ID is required");
  }
  const staff = await User.findById(staffId);
  if (!staff || staff.role !== "staff") {
    throw new APIError(404, "Staff not found");
  }
  staff.name = name || staff.name;
  staff.email = email || staff.email;
  staff.phone = phone || staff.phone;
  if (password) {
    staff.password = password;
  }
  await staff.save();
  res
    .status(200)
    .json(
      new APIResponse(200, staff, "Staff information updated successfully")
    );
});

const getStaffInfo = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { staffId } = req.params;
  if (!staffId) {
    throw new APIError(400, "Staff ID is required");
  }
  const staff = await User.findById(staffId);
  if (!staff || staff.role !== "staff") {
    throw new APIError(404, "Staff not found");
  }
  res
    .status(200)
    .json(
      new APIResponse(200, staff, "Staff information retrieved successfully")
    );
});

const getAllStaff = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }

  const staff = await User.find({ role: "staff" });
  if (!staff || staff.length === 0) {
    throw new APIError(404, "No staff found");
  }
  res
    .status(200)
    .json(new APIResponse(200, staff, "Staff retrieved successfully"));
});

const removeStaff = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }

  const { staffId } = req.params;
  if (!staffId) {
    throw new APIError(400, "Staff ID is required");
  }
  const staff = await User.findById(staffId);
  if (!staff || staff.role !== "staff") {
    throw new APIError(404, "Staff not found");
  }
  await staff.remove();
  res
    .status(200)
    .json(new APIResponse(200, null, "Staff removed successfully"));
});

export {
  staffRegister,
  updateStaffInfo,
  getStaffInfo,
  getAllStaff,
  removeStaff,
};
