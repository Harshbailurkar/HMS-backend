import { asyncHandler } from "../../utils/asyncHandler.js";
import { APIResponse } from "../../utils/apiResponse.js";
import { VisitorLogService } from "../../services/visitorLog.service.js";
import { APIError } from "../../utils/apiError.js";

const addVisitorLog = asyncHandler(async (req, res) => {
  if (req.user?.role === "tenant") {
    throw new APIError(403, "Only admins or staff can add visitor logs");
  }

  const { studentId, visitorName, relation, purpose, checkIn } = req.body;
  if (!studentId || !visitorName || !relation || !checkIn) {
    throw new APIError(
      400,
      "Missing required fields: studentId, visitorName, relation, checkIn"
    );
  }
  const documentFilePath = req.file?.path;

  const visitorLog = await VisitorLogService.addLog({
    studentId,
    visitorName,
    relation,
    purpose,
    checkIn,
    verifiedBy: req.user?._id || null,
    documentFilePath,
  });

  res
    .status(201)
    .json(new APIResponse(201, visitorLog, "Visitor log added successfully"));
});

const getVisitorLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { logs, pagination } = await VisitorLogService.getLogs(page, limit);

  res
    .status(200)
    .json(new APIResponse(200, logs, "Visitor logs retrieved", pagination));
});

const markVisitorCheckout = asyncHandler(async (req, res) => {
  const { logId } = req.params;
  const log = await VisitorLogService.markCheckout(logId);

  res
    .status(200)
    .json(new APIResponse(200, log, "Visitor checkout marked successfully"));
});

export { addVisitorLog, getVisitorLogs, markVisitorCheckout };
