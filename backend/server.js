import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);


app.get("/", (req, res) => {
    res.send("Backendul functioneaza");
});


sequelize.sync().then(() => {
    app.listen(process.env.PORT || 5000, () =>
        console.log("Server running on port 5000")
    );
});
