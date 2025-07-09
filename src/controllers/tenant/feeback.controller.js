import { Feedback } from "../../models/tenant/feedback.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { APIResponse } from "../../utils/apiResponse";
import { APIError } from "../../utils/apiError";

const sendFeedback = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "tenant") {
    throw new APIError("Access Denied!");
  }
  const { tenantId } = req.user.Id;
  const { message, category } = req.body;

  if (!message) {
    throw new APIError("Feedback message is required", 400);
  }

  const feedback = await Feedback.create({
    tenantId,
    category,
    message,
  });

  return res.status(201).json(
    new APIResponse("Feedback sent successfully", {
      feedback,
    })
  );
});

const seeFeedback = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.user.Id;
  if (req.user.role !== "tenant") {
    throw new APIError("Access Denied!");
  }
  if (!tenantId) {
    throw new APIError("Tenant ID is required", 400);
  }
  const feedbacks = await Feedback.find({ tenantId });

  return res.status(200).json(
    new APIResponse("Feedbacks retrieved successfully", {
      feedbacks,
    })
  );
});

export { sendFeedback, seeFeedback };
