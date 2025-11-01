import { Activity } from "../models/Activity.js";

export const createActivity = async (req, res) => {
    try {
        const { description, duration, accessCode } = req.body;

        if (!description || !duration || !accessCode) {
            return res.status(400).json({ message: "Toate câmpurile sunt obligatorii" });
        }

        const now = new Date();

        // Caută toate activitățile cu același cod
        const existingActivities = await Activity.findAll({
            where: { accessCode },
            order: [["date", "DESC"]],
        });

        // Verifică dacă vreuna este încă activă
        const activeActivity = existingActivities.find((act) => {
            const activityDate = new Date(act.date); // convertim în Date
            const endTime = new Date(activityDate.getTime() + act.duration * 60000);
            return endTime > now; // încă activă
        });

        if (activeActivity) {
            return res.status(400).json({
                message: "Codul de acces este folosit de o activitate încă activă",
            });
        }

        // Creează activitatea dacă nu există activitate activă
        const activity = await Activity.create({
            description,
            duration,
            accessCode,
        });

        res.status(201).json({ message: "Activitate creată cu succes", activity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la crearea activității" });
    }
};

// Endpoint pentru student – joinActivity
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
