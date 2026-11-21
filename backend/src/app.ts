import menuRoutes from "./routes/menuRoutes";
import express from "express";
import cors from "cors";
import restaurantRoutes from "./routes/restaurantRoutes";
import orderRoutes from "./routes/orderRoutes";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import profileRoutes from "./routes/profileRoutes";
import addressRoutes from "./routes/addressRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";

const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//   })
// );

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// app.use("/api/auth", authRoutes);

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

// API routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
// Restaurant-specific menu endpoints
app.use("/api", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Customer profile and saved addresses
app.use("/api/profile", profileRoutes);
app.use("/api/addresses", addressRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/delivery", deliveryRoutes);

export default app;
