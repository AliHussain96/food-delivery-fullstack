
import express from "express";
import cors from "cors";
import restaurantRoutes from "./routes/restaurantRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodNest Backend API is running successfully",
  });
});

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});

// Restaurant routes
app.use("/api/restaurants", restaurantRoutes);

export default app;
