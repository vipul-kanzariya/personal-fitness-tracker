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
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());
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

const PORT = 3000;
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
