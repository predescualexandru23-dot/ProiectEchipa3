import express from "express";
import { createActivity } from "../controllers/activityController.js";
import { addFeedback, getFeedback, getActivityWithFeedback } from "../controllers/feedbackController.js";
import { joinActivity } from "../controllers/activityController.js";

const router = express.Router();

router.post("/", createActivity);
router.post("/feedback", addFeedback);
router.post("/join", joinActivity);
router.get("/full/:accessCode", getActivityWithFeedback);
router.get("/feedback/:accessCode", getFeedback);

export default router;
