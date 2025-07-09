import mongoose from "mongoose";

const documentUploadSchema = new mongoose.Schema(
  {
    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "relatedModel",
    },

    relatedModel: {
      type: String,
      required: true,
      enum: ["User", "VisitorLog", "MaintenanceRequest"],
    },

    type: {
      type: String,
      enum: [
        "id_proof",
        "address_proof",
        "visitor_id",
        "maintenance_image",
        "other",
      ],
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentUpload = mongoose.model(
  "DocumentUpload",
  documentUploadSchema
);
