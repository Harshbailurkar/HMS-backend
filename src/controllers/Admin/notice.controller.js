import { APIError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";
import { Notice } from "../../models/Notice.js";

const createNotice = asyncHandler(async (req, res) => {
  const { title, message, audience } = req.body;

  if (!title || !message) {
    throw new APIError(400, "Title and message are required");
  }

  const notice = await Notice.create({
    title,
    message,
    audience,
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json(new APIResponse(201, notice, "Notice created successfully"));
});

const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find().populate("createdBy", "name email");

  res
    .status(200)
    .json(new APIResponse(200, notices, "Notices retrieved successfully"));
});

const deleteNotice = asyncHandler(async (req, res) => {
  const { noticeId } = req.params;

  const notice = await Notice.findById(noticeId);
  if (!notice) {
    throw new APIError(404, "Notice not found");
  }

  if (notice.createdBy.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You do not have permission to delete this notice");
  }

  await notice.remove();

  res
    .status(200)
    .json(new APIResponse(200, null, "Notice deleted successfully"));
});

const updateNotice = asyncHandler(async (req, res) => {
  const { noticeId } = req.params;
  const { title, message, audience } = req.body;

  const notice = await Notice.findById(noticeId);
  if (!notice) {
    throw new APIError(404, "Notice not found");
  }

  if (notice.createdBy.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You do not have permission to update this notice");
  }

  notice.title = title || notice.title;
  notice.message = message || notice.message;
  notice.audience = audience || notice.audience;

  await notice.save();

  res
    .status(200)
    .json(new APIResponse(200, notice, "Notice updated successfully"));
});

export { createNotice, getNotices, deleteNotice, updateNotice };
