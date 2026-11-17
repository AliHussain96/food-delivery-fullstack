
import "dotenv/config";
import app from "./app";
import connectDB from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server after DB connection
    app.listen(PORT, () => {
      console.log(
        `FoodNest server running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Unable to start FoodNest server:", error);
    process.exit(1);
  }
}

startServer();
