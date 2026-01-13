import { Activity } from "../models/Activity.js";

// 🔹 Creează activitate (profesor)

export const createActivity = async (req, res) => {
    try {
        const { description, duration, accessCode } = req.body;
        const userId = req.user.id; // profesorul logat

        if (!description || !duration || !accessCode) {
            return res.status(400).json({
                message: "Please fill in all the text fields",
            });
        }

        // 🔴 VERIFICARE DESCRIERE DUPLICATĂ (per profesor)
        const existingWithSameDescription = await Activity.findOne({
            where: {
                description,
                UserId: userId,
            },
        });

        if (existingWithSameDescription) {
            return res.status(400).json({
                message:
                    "There already is an activity with this title, please use a different one!",
            });
        }

        const now = new Date();

        // 🔵 Verificare cod activ (ce aveai deja)
        const existingActivities = await Activity.findAll({
            where: { accessCode, UserId: userId },
            order: [["date", "DESC"]],
        });

        const activeActivity = existingActivities.find((act) => {
            const endTime = new Date(
                new Date(act.date).getTime() + act.duration * 60000
            );
            return endTime > now;
        });

        if (activeActivity) {
            return res.status(400).json({
                message: "This access code is used by another activity that is currently running",
            });
        }

        // ✅ Creează activitatea
        const activity = await Activity.create({
            description,
            duration,
            accessCode,
            UserId: userId,
        });

        res.status(201).json({
            message: "Activity created succesfully!",
            activity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating activity",
        });
    }
};


// 🔹 Obține activitatea curentă (profesor)
export const getActiveActivityWithFeedback = async (req, res) => {
    try {
        const now = new Date();

        const activity = await Activity.findOne({
            where: { UserId: req.user.id },
            order: [["date", "DESC"]],
            include: ["feedbacks"],
        });

        if (!activity) return res.status(404).json({ message: "No activity" });

        const endTime = new Date(activity.date.getTime() + activity.duration * 60000);
        if (endTime < now) return res.status(404).json({ message: "No active activity" });

        res.json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching current activity" });
    }
};

// 🔹 Obține activitățile trecute (profesor)
export const getPastActivities = async (req, res) => {
    try {
        const now = new Date();

        const activities = await Activity.findAll({
            where: { UserId: req.user.id },
            order: [["date", "DESC"]],
            include: ["feedbacks"],
        });

        const pastActivities = activities.filter((a) => {
            const end = new Date(a.date.getTime() + a.duration * 60000);
            return end < now;
        });

        res.json(pastActivities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching past activities" });
    }
};

// 🔹 Endpoint pentru student – joinActivity
export const joinActivity = async (req, res) => {
    try {
        const { accessCode } = req.body;

        if (!accessCode) {
            return res.status(400).json({ message: "You must enter an activity code" });
        }

        const now = new Date();

        // Caută toate activitățile cu codul respectiv, cea mai recentă prima
        const activities = await Activity.findAll({
            where: { accessCode },
            order: [["date", "DESC"]],
        });

        // Găsește activitatea activă
        const activity = activities.find((act) => {
            const endTime = new Date(act.date.getTime() + act.duration * 60000);
            return endTime > now;
        });

        if (!activity) {
            return res.status(404).json({ message: "Activity code invalid or activity already finished" });
        }

        res.json(activity); // trimite activitatea activă către frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error accessing activity" });
    }
};
