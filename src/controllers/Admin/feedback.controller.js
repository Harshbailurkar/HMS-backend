import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";
import { APIError } from "../../utils/apiError";
import { Feedback } from "../../models/tenant/feedback.model";

const getALlFeedbacks = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new APIError(403, "Access denied. Only admin can view feedbacks.");
  }
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new APIResponse("Feedbacks retrieved successfully", {
      feedbacks,
    })
  );
});

const changeFeedbackStatus = asyncHandler(async (req, res, next) => {
  const { feedbackId } = req.params;
    const { status } = req.body;
    if (!feedbackId || !status) {
    throw new APIError("Feedback ID and status are required", 400);
    }
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
    throw new APIError("Feedback not found", 404);
    }
    if (feedback.status === status) {
    throw new APIError("Feedback is already in the requested status", 400);
    }
    feedback.status= status;
    feedback.save();

    return res.status(200).json(new APIResponse("feedback status changed"));

  });


export { getALlFeedbacks,changeFeedbackStatus};
