require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
//Routes
const authRoutes = require("./routes/auth");
const workoutRoutes = require("./routes/workout");
const dietRoutes = require("./routes/diet");
const bmiRoutes = require("./routes/bmi");
const foodRoutes = require("./routes/food");
const orderRoutes = require("./routes/order");
const adminRoutes = require('./routes/admin');
const workoutTypeRoutes = require('./routes/workoutType');
const feedbackRoutes = require('./routes/feedback');
const aiRoutes = require('./routes/ai');
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
}));
app.get("/", (req, res) => {
  res.json("Welcome");
});
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/bmi",bmiRoutes);
app.use("/api/food",foodRoutes);
app.use("/api/orders",orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workout-types', workoutTypeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

const PORT =process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:` + PORT);
      console.log("Database connected");
    });
  })
  .catch((error) => {
    console.log(error);
  });
