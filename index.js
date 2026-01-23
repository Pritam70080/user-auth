import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";

import db from "./utils/db.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(urlencoded({extended :true}));
app.use(cors({
    origin: process.env.BASE_URL,
    methods: ["GET", "POST", "UPDATE", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Hello from backend😀");
})
app.use("/api/v1/users", userRouter);

const PORT = process.env.PORT || 8000;

db();

app.listen(PORT, () => {
    console.log("Server is listening at port:", PORT)
});