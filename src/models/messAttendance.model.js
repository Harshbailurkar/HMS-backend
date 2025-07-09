import mongoose from "mongoose";

const messAttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },

    attended: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MessAttendance = mongoose.model(
  "MessAttendance",
  messAttendanceSchema
);
