import { VisitorLog } from "../models/visitorLog.model.js";
import { DocumentUpload } from "../models/documentUpload.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIError } from "../utils/apiError.js";

export const VisitorLogService = {
  addLog: async ({
    studentId,
    visitorName,
    relation,
    purpose,
    checkIn,
    verifiedBy,
    documentFilePath,
  }) => {
    if (!studentId || !visitorName || !relation || !checkIn) {
      throw new APIError(
        400,
        "Required fields: studentId, visitorName, relation, checkIn"
      );
    }

    // Create visitor log first
    const visitorLog = await VisitorLog.create({
      studentId,
      visitorName,
      relation,
      purpose,
      checkIn,
      verifiedBy,
    });

    // Upload document to Cloudinary
    let uploadedDoc = null;
    if (documentFilePath) {
      const result = await uploadOnCloudinary(documentFilePath);
      if (result?.secure_url) {
        uploadedDoc = await DocumentUpload.create({
          relatedTo: visitorLog._id,
          relatedModel: "VisitorLog",
          type: "visitor_id",
          fileUrl: result.secure_url,
          uploadedBy: verifiedBy,
        });

        // Link the uploaded document to the visitor log
        visitorLog.documentId = uploadedDoc._id;
        await visitorLog.save();
      }
    }

    return visitorLog;
  },

  getLogs: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const visitorLogs = await VisitorLog.find()
      .populate("studentId", "name email phone")
      .populate("verifiedBy", "name role")
      .populate("documentId", "fileUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalLogs = await VisitorLog.countDocuments();
    const totalPages = Math.ceil(totalLogs / limit);

    return {
      logs: visitorLogs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalLogs,
      },
    };
  },

  markCheckout: async (logId, checkOutTime) => {
    const log = await VisitorLog.findById(logId);
    if (!log) throw new APIError(404, "Visitor log not found");
    if (log.checkOut) throw new APIError(400, "Checkout already marked");

    log.checkOut = checkOutTime || new Date();
    await log.save();

    return log;
  },
};
