import express from "express";
import { forgotPassword, getProfile, login, logout, register, resendEmailVerification, resetPassword, verify } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/user.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.get("/verify/:token", verify);
userRouter.post("/login", login);
userRouter.get("/profile", verifyToken, getProfile);
userRouter.get("/logout", verifyToken, logout);
userRouter.post("/resend-verify-email", resendEmailVerification);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/forgot-password/:token", resetPassword);

export default userRouter;