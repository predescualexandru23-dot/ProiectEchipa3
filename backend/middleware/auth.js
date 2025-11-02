import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN
    if (!token) return res.status(401).json({ message: "Token lipsă" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: "Utilizator inexistent" });

        req.user = user; // adăugăm user în request
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalid" });
    }
};
