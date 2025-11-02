import express from "express";
import {
    createActivity,
    getActiveActivityWithFeedback,
    getPastActivities,
    joinActivity,
} from "../controllers/activityController.js";
import { addFeedback, getFeedback, getActivityWithFeedback } from "../controllers/feedbackController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Rute profesor – necesită token
router.post("/", verifyToken, createActivity);
router.get("/current", verifyToken, getActiveActivityWithFeedback);
router.get("/past", verifyToken, getPastActivities);

// 🔹 Rute student
router.post("/join", joinActivity);
router.get("/full/:accessCode", getActivityWithFeedback);
router.get("/feedback/:accessCode", getFeedback);
router.post("/feedback", addFeedback);

export default router;
