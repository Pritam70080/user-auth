import express, { urlencoded, type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import db from "./utils/db.js";
import authRouter from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.BASE_URL ?? "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from backend😀");
});

app.use("/api/v1/auth", authRouter);

const PORT = Number(process.env.PORT ?? 8000);

db();

app.listen(PORT, () => {
  console.log("Server is listening at port:", PORT);
});