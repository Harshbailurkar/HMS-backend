import { APIError } from "../../utils/apiError";
import { User } from "../../models/user.model";
import { Room } from "../../models/room.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";

const tenantRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, roomId, messPreference } = req.body;
  if (!name || !email || !password || !phone || !roomId || !messPreference) {
    throw new APIError(400, "All fields are required");
  }
  const existingUser = await User.find({ email, role: "tenant" });
  if (existingUser.length > 0) {
    throw new APIError(400, "Tenant already exists");
  }
  const user = new User({
    name,
    email,
    password,
    phone,
    role: "tenant",
    roomId,
    messPreference,
    status: "active",
  });
  await user.save();
  res
    .status(201)
    .json(new APIResponse(201, user, "Tenant registered successfully"));
});

const updateTenantInfo = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.params;
  const { messPreference, name, email, phone, roomId, password, status } =
    req.body;

  if (!tenantId) {
    throw new APIError(400, "Tenant ID is required");
  }

  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "tenant") {
    throw new APIError(404, "Tenant not found");
  }

  tenant.name = name || tenant.name;
  tenant.email = email || tenant.email;
  tenant.phone = phone || tenant.phone;
  tenant.roomId = roomId || tenant.roomId;
  tenant.messPreference = messPreference || tenant.messPreference;
  tenant.status = status || tenant.status;

  if (password) {
    tenant.password = password;
  }

  await tenant.save();

  res
    .status(200)
    .json(
      new APIResponse(200, tenant, "Tenant information updated successfully")
    );
});

const getTenantInfo = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw new APIError(400, "Tenant ID is required");
  }
  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "tenant") {
    throw new APIError(404, "Tenant not found");
  }
  res
    .status(200)
    .json(
      new APIResponse(200, tenant, "Tenant information retrieved successfully")
    );
});

const getAllTenants = asyncHandler(async (req, res, next) => {
  const tenants = await User.find({ role: "tenant" });
  if (!tenants || tenants.length === 0) {
    throw new APIError(404, "No tenants found");
  }
  res
    .status(200)
    .json(new APIResponse(200, tenants, "Tenants retrieved successfully"));
});

const getAllRooms = asyncHandler(async (req, res, next) => {
  const rooms = await Room.find();
  if (!rooms || rooms.length === 0) {
    throw new APIError(404, "No rooms found");
  }
  res
    .status(200)
    .json(new APIResponse(200, rooms, "Rooms retrieved successfully"));
});

const getAllTenantsInRoom = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;
  if (!roomId) {
    throw new APIError(400, "Room ID is required");
  }
  const tenants = await User.find({ roomId, role: "tenant" });
  if (!tenants || tenants.length === 0) {
    throw new APIError(404, "No tenants found in this room");
  }
  res
    .status(200)
    .json(
      new APIResponse(200, tenants, "Tenants in room retrieved successfully")
    );
});

const removeTenant = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw new APIError(400, "Tenant ID is required");
  }
  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "tenant") {
    throw new APIError(404, "Tenant not found");
  }
  await tenant.remove();
  res
    .status(200)
    .json(new APIResponse(200, null, "Tenant removed successfully"));
});

export {
  tenantRegister,
  updateTenantInfo,
  getTenantInfo,
  getAllTenants,
  getAllRooms,
  getAllTenantsInRoom,
  removeTenant,
};
