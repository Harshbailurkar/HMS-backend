import { Room } from "../../models/room.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";
import { APIError } from "../../utils/apiError";

const addRoom = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }

  const { roomNumber, type, capacity } = req.body;

  if (!roomNumber || !type || !capacity) {
    throw new APIError(400, "All fields are required");
  }

  const existingRoom = await Room.findOne({ roomNumber });
  if (existingRoom) {
    throw new APIError(400, "Room already exists");
  }

  const room = new Room({
    roomNumber,
    type,
    capacity,
    currentStudents: [],
    status: "available",
  });

  await room.save();

  res.status(201).json(new APIResponse(201, room, "Room added successfully"));
});

const updateRoom = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { roomId } = req.params;
  const { roomNumber, type, capacity, status } = req.body;

  if (!roomNumber && !type && !capacity && !status) {
    throw new APIError(400, "At least one field is required to update");
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new APIError(404, "Room not found");
  }

  if (roomNumber) room.roomNumber = roomNumber;
  if (type) room.type = type;
  if (capacity) room.capacity = capacity;
  if (status) room.status = status;

  await room.save();

  res.status(200).json(new APIResponse(200, room, "Room updated successfully"));
});

const deleteRoom = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { roomId } = req.params;

  const room = await Room.findById(roomId);
  if (!room) {
    throw new APIError(404, "Room not found");
  }

  await room.remove();

  res.status(200).json(new APIResponse(200, null, "Room deleted successfully"));
});

const getAllRooms = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const rooms = await Room.find();
  if (!rooms || rooms.length === 0) {
    throw new APIError(404, "No rooms found");
  }
  res
    .status(200)
    .json(new APIResponse(200, rooms, "Rooms retrieved successfully"));
});

const getRoomById = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const { roomId } = req.params;

  const room = await Room.findById(roomId);
  if (!room) {
    throw new APIError(404, "Room not found");
  }
  res
    .status(200)
    .json(new APIResponse(200, room, "Room retrieved successfully"));
});

const getAvailableRooms = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admins can add rooms.");
  }
  const rooms = await Room.find({ status: "available" });
  if (!rooms || rooms.length === 0) {
    throw new APIError(404, "No available rooms found");
  }
  res
    .status(200)
    .json(
      new APIResponse(200, rooms, "Available rooms retrieved successfully")
    );
});

export {
  addRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  getAvailableRooms,
};
