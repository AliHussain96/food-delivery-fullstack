
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully");

    // Display connected database name
    console.log(
      "Connected Database Name:",
      mongoose.connection.name
    );

    // Display connection status
    console.log(
      "MongoDB Connection Status:",
      mongoose.connection.readyState
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
