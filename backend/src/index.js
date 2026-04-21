const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const pool = require("./config/db");
const officerRoutes = require("./routes/officerRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const rotationRoutes = require("./routes/rotationRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/rotations", rotationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Tanganyika PMS backend is running",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});