
import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home API route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodNest Backend API is running successfully",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});

export default app;
