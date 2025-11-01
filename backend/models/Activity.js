import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Activity = sequelize.define("Activity", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // minute
        allowNull: false,
    },
    accessCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});
