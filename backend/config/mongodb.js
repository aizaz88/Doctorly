import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connect", () => console.log("Database connected"));
    await mongoose.connect(`${process.env.MONGODB_URI}/Doctorly`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
