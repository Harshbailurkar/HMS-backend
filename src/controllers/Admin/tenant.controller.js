import { APIError } from "../../utils/apiError.js";
import { User } from "../../models/user.model.js";
import { Room } from "../../models/room.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { APIResponse } from "../../utils/apiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { DocumentUpload } from "../../models/documentUpload.model.js";

const tenantRegister = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }

  const { name, email, password, phone, roomId, messPreference } = req.body;
  const documentFilePath = req.file?.path;

  if (!name || !email || !password || !phone || !roomId || !messPreference) {
    throw new APIError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email, role: "tenant" });
  if (existingUser) {
    throw new APIError(400, "Tenant already exists");
  }

  const room = await Room.findById(roomId);
  if (!room) throw new APIError(404, "Room not found");

  if (room.currentTenants.length >= room.capacity) {
    throw new APIError(400, "Room is already full");
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

  if (documentFilePath) {
    const result = await uploadOnCloudinary(documentFilePath);
    if (result?.secure_url) {
      await DocumentUpload.create({
        relatedTo: user._id,
        relatedModel: "User",
        type: "id_proof",
        fileUrl: result.secure_url,
        uploadedBy: req.user._id,
      });
    }
  }

  room.currentTenants.push(user._id);
  room.status =
    room.currentTenants.length >= room.capacity ? "full" : "available";
  await room.save();

  res.status(201).json(
    new APIResponse(
      201,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        messPreference: user.messPreference,
        roomId: user.roomId,
      },
      "Tenant registered successfully"
    )
  );
});

const updateTenantInfo = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { tenantId } = req.params;
  const { messPreference, name, email, phone, roomId, password, status } =
    req.body;

  if (!tenantId) throw new APIError(400, "Tenant ID is required");

  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "tenant") {
    throw new APIError(404, "Tenant not found");
  }

  if (roomId && roomId !== tenant.roomId?.toString()) {
    const oldRoom = await Room.findById(tenant.roomId);
    const newRoom = await Room.findById(roomId);

    if (!newRoom) throw new APIError(404, "New room not found");
    if (newRoom.currentTenants.length >= newRoom.capacity) {
      throw new APIError(400, "New room is already full");
    }

    if (oldRoom) {
      oldRoom.currentTenants = oldRoom.currentTenants.filter(
        (id) => id.toString() !== tenant._id.toString()
      );
      oldRoom.status =
        oldRoom.currentTenants.length >= oldRoom.capacity
          ? "full"
          : "available";
      await oldRoom.save();
    }

    newRoom.currentTenants.push(tenant._id);
    newRoom.status =
      newRoom.currentTenants.length >= newRoom.capacity ? "full" : "available";
    await newRoom.save();

    tenant.roomId = roomId;
  }

  tenant.name = name || tenant.name;
  tenant.email = email || tenant.email;
  tenant.phone = phone || tenant.phone;
  tenant.messPreference = messPreference || tenant.messPreference;
  tenant.status = status || tenant.status;
  if (password) tenant.password = password;

  await tenant.save();

  res
    .status(200)
    .json(
      new APIResponse(200, tenant, "Tenant information updated successfully")
    );
});

const getTenantInfo = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { tenantId } = req.params;
  if (!tenantId) throw new APIError(400, "Tenant ID is required");

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

const getAllTenants = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }

  const tenants = await User.find({ role: "tenant" });
  if (!tenants || tenants.length === 0) {
    throw new APIError(404, "No tenants found");
  }

  res
    .status(200)
    .json(new APIResponse(200, tenants, "Tenants retrieved successfully"));
});

const getAllTenantsInRoom = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { roomId } = req.params;
  if (!roomId) throw new APIError(400, "Room ID is required");

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

const removeTenant = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { tenantId } = req.params;
  if (!tenantId) throw new APIError(400, "Tenant ID is required");

  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "tenant") {
    throw new APIError(404, "Tenant not found");
  }

  const room = await Room.findById(tenant.roomId);
  if (room) {
    room.currentTenants = room.currentTenants.filter(
      (id) => id.toString() !== tenant._id.toString()
    );
    room.status =
      room.currentTenants.length >= room.capacity ? "full" : "available";
    await room.save();
  }

  await tenant.remove();

  res
    .status(200)
    .json(new APIResponse(200, null, "Tenant removed successfully"));
});

const viewTenantProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(
      403,
      "Access denied. Only admins can view tenant profiles."
    );
  }

  const tenantId = req.params.tenantId;
  if (!tenantId) {
    throw new APIError(400, "Tenant ID is required");
  }

  const tenant = await User.findById(tenantId).populate("roomId");

  if (!tenant) {
    throw new APIError(404, "Tenant not found");
  }

  const documentUploads = await DocumentUpload.find({
    relatedTo: tenantId,
    relatedModel: "User",
  });

  const response = {
    _id: tenant._id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    role: tenant.role,
    messPreference: tenant.messPreference,
    status: tenant.status,
    room: tenant.roomId
      ? {
          roomNumber: tenant.roomId.roomNumber,
          floor: tenant.roomId.floor,
          capacity: tenant.roomId.capacity,
          status: tenant.roomId.status,
        }
      : null,

    documentUploads: documentUploads.map((doc) => ({
      _id: doc._id,
      type: doc.type,
      fileUrl: doc.fileUrl,
      uploadedAt: doc.createdAt,
    })),
  };

  res
    .status(200)
    .json(
      new APIResponse(200, response, "Tenant profile retrieved successfully")
    );
});

const uploadAdditinalDocument = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new APIError(
      403,
      "Access denied. Only admins can upload additional documents."
    );
  }
  const { tenantId } = req.params;
  const documentFilePath = req.file?.path;
  if (!tenantId) throw new APIError(400, "Tenant ID is required");
  if (!documentFilePath) {
    throw new APIError(400, "Document file is required");
  }
  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "tenant") {
    throw new APIError(404, "Tenant not found");
  }
  const result = await uploadOnCloudinary(documentFilePath);
  if (!result?.secure_url) {
    throw new APIError(500, "Failed to upload document");
  }
  await DocumentUpload.create({
    relatedTo: tenant._id,
    relatedModel: "User",
    type: "additional_document",
    fileUrl: result.secure_url,
    uploadedBy: req.user._id,
  });

  res
    .status(201)
    .json(
      new APIResponse(201, null, "Additional document uploaded successfully")
    );
});

export {
  tenantRegister,
  updateTenantInfo,
  getTenantInfo,
  getAllTenants,
  getAllTenantsInRoom,
  removeTenant,
  viewTenantProfile,
  uploadAdditinalDocument,
};
