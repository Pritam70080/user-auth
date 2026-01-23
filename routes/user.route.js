import express from "express";
import { getProfile, login, logout, register, verify } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/user.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.get("/verify/:token", verify);
userRouter.post("/login", login);
userRouter.get("/profile", verifyToken, getProfile);
userRouter.get("/logout", verifyToken, logout);

export default userRouter;