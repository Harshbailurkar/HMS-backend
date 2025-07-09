import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    audience: {
      type: String,
      enum: ["all", "students", "staff"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

export const Notice = mongoose.model("Notice", noticeSchema);
