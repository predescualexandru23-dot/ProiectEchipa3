import { Activity } from "../models/Activity.js";

export const createActivity = async (req, res) => {
    try {
        const { description, duration, accessCode } = req.body;

        if (!description || !duration || !accessCode) {
            return res.status(400).json({ message: "Toate câmpurile sunt obligatorii" });
        }

        const existing = await Activity.findOne({ where: { accessCode } });
        if (existing) {
            return res.status(400).json({ message: "Codul de acces există deja" });
        }

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
