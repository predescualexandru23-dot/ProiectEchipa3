import { Activity } from "../models/Activity.js";
import { Feedback } from "../models/Feedback.js";

export const addFeedback = async (req, res) => {
    try {
        const { accessCode, emoji } = req.body;

        const now = new Date();
        const activities = await Activity.findAll({
            where: { accessCode },
            order: [["date", "DESC"]],
        });

        const activity = activities.find((act) => {
            const endTime = new Date(act.date.getTime() + act.duration * 60000);
            return endTime > now;
        });

        if (!activity) return res.status(404).json({ message: "Activitate inexistentă sau s-a încheiat" });

        const feedback = await Feedback.create({ emoji, ActivityId: activity.id });

        res.status(201).json({ message: "Feedback adăugat", feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la adăugarea feedback-ului" });
    }
};


export const getFeedback = async (req, res) => {
    try {
        const { accessCode } = req.params;

        const now = new Date();

        const activities = await Activity.findAll({
            where: { accessCode },
            order: [["date", "DESC"]],
            include: [{
                model: Feedback,
                as: "feedbacks",
                order: [["timestamp", "ASC"]] // 🔥 CHEIA PROBLEMEI
            }],
        });

        const activity = activities.find((act) => {
            const endTime = new Date(act.date.getTime() + act.duration * 60000);
            return endTime > now;
        });

        if (!activity) {
            return res.status(404).json({
                message: "Activitate inexistentă sau s-a încheiat"
            });
        }

        // siguranță extra: sortare finală
        const sortedFeedbacks = activity.feedbacks.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        res.json(sortedFeedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la obținerea feedback-ului" });
    }
};



// Obține activitatea completă + feedback pentru frontend
export const getActivityWithFeedback = async (req, res) => {
    try {
        const { accessCode } = req.params;

        const activity = await Activity.findOne({
            where: { accessCode },
            include: [{ model: Feedback, as: "feedbacks" }],
        });

        if (!activity) return res.status(404).json({ message: "Activitate inexistentă" });

        res.json({
            accessCode: activity.accessCode,
            date: activity.date.toISOString(), // transformă în string ISO
            duration: activity.duration,
            feedbacks: activity.feedbacks, // poate fi []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la obținerea activității" });
    }
};
