import mongoose from "mongoose";

const visitorLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  visitorName: {
    type: String,
    required: true,
  },

  relation: {
    type: String,
    required: true,
  },

  purpose: {
    type: String,
    default: "",
  },

  checkIn: {
    type: Date,
    required: true,
  },

  checkOut: {
    type: Date,
    default: null,
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // usually a staff or admin
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const VisitorLog = mongoose.model("VisitorLog", visitorLogSchema);
