import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./User.js"; // importăm modelul User pentru relație

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
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accessCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// 🔗 Relații: fiecare activitate aparține unui profesor (User)
Activity.belongsTo(User, {
    foreignKey: {
        name: "UserId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
User.hasMany(Activity, {
    foreignKey: "UserId",
    onDelete: "CASCADE",
});
