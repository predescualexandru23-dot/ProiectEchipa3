import { Activity } from "../models/Activity.js";

// 🔹 Creează activitate (profesor)
export const createActivity = async (req, res) => {
    try {
        const { description, duration, accessCode } = req.body;

        if (!description || !duration || !accessCode) {
            return res.status(400).json({ message: "Toate câmpurile sunt obligatorii" });
        }

        const now = new Date();

        // Caută activități cu același cod pentru profesorul curent
        const existingActivities = await Activity.findAll({
            where: { accessCode, UserId: req.user.id },
            order: [["date", "DESC"]],
        });

        // Verifică dacă vreuna este încă activă
        const activeActivity = existingActivities.find((act) => {
            const endTime = new Date(act.date.getTime() + act.duration * 60000);
            return endTime > now; // încă activă
        });

        if (activeActivity) {
            return res.status(400).json({
                message: "Codul de acces este folosit de o activitate încă activă",
            });
        }

        // Creează activitatea
        const activity = await Activity.create({
            description,
            duration,
            accessCode,
            UserId: req.user.id, // asociem activitatea cu profesorul logat
        });

        res.status(201).json({ message: "Activitate creată cu succes", activity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la crearea activității" });
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

        if (!activity) return res.status(404).json({ message: "Nicio activitate" });

        const endTime = new Date(activity.date.getTime() + activity.duration * 60000);
        if (endTime < now) return res.status(404).json({ message: "Nicio activitate activă" });

        res.json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la obținerea activității curente" });
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
        res.status(500).json({ message: "Eroare la obținerea activităților trecute" });
    }
};

// 🔹 Endpoint pentru student – joinActivity
export const joinActivity = async (req, res) => {
    try {
        const { accessCode } = req.body;

        if (!accessCode) {
            return res.status(400).json({ message: "Trebuie să introduci un cod de activitate" });
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
            return res.status(404).json({ message: "Codul activității nu este valid sau activitatea s-a încheiat" });
        }

        res.json(activity); // trimite activitatea activă către frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la accesarea activității" });
    }
};
