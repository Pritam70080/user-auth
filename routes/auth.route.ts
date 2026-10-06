import { Router } from "express";
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  resendEmailVerification,
  resetPassword,
  verify,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/user.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.get("/verify/:token", verify);
authRouter.post("/login", login);
authRouter.get("/profile", verifyToken, getProfile);
authRouter.get("/logout", verifyToken, logout);
authRouter.post("/resend-verify-email", resendEmailVerification);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/forgot-password/:token", resetPassword);

export default authRouter;