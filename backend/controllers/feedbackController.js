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

        // Caută cea mai recentă activitate activă
        const now = new Date();
        const activities = await Activity.findAll({
            where: { accessCode },
            order: [["date", "DESC"]],
            include: [{ model: Feedback, as: "feedbacks" }],
        });

        const activity = activities.find((act) => {
            const endTime = new Date(act.date.getTime() + act.duration * 60000);
            return endTime > now;
        });

        if (!activity) return res.status(404).json({ message: "Activitate inexistentă sau s-a încheiat" });

        res.json(activity.feedbacks);
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
