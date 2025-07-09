import { Notice } from "../../models/notice.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";
import { APIError } from "../../utils/apiError";

const getNotices = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "tenant") {
    throw new APIError(403, "Access denied. Only tenant can view notices.");
  }
  const notices = await Notice.find({ audience: "tenant" }).sort({
    createdAt: -1,
  });
  res
    .status(200)
    .json(new APIResponse(200, notices, "Notices retrieved successfully"));
});

export { getNotices };
