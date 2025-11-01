// models/Feedback.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Activity } from "./Activity.js";

export const Feedback = sequelize.define("Feedback", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    emoji: { type: DataTypes.ENUM("happy", "sad", "surprised", "confused"), allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// Relație
Activity.hasMany(Feedback, { as: "feedbacks" });
Feedback.belongsTo(Activity);
