import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected."))
    .catch((error) => console.error("Error connecting DB: ", error))
}

export default db