import express, { urlencoded, type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import db from "./utils/db.js";
import authRouter from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiResponse } from "./types/apiResponse.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
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
app.use((req: Request, res: Response) => {
  res.status(404).json(new ApiResponse("Route not found.", null, 404));
});
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 8000);

db();

app.listen(PORT, () => {
  console.log("Server is listening at port:", PORT);
});