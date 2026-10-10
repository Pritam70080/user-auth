import { Router } from "express";
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  refresh,
  register,
  resendEmailVerification,
  resetPassword,
  verify,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createUserSchema,
  emailSchema,
  loginSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema.js";
import { validateBody } from "../utils/validate.js";

const authRouter = Router();

authRouter.post("/register", validateBody(createUserSchema), register);
authRouter.get("/verify/:token", verify);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/refresh", refresh);
authRouter.get("/profile", verifyToken, getProfile);
authRouter.get("/logout", verifyToken, logout);
authRouter.post("/resend-verify-email", validateBody(emailSchema), resendEmailVerification);
authRouter.post("/forgot-password", validateBody(emailSchema), forgotPassword);
authRouter.post("/forgot-password/:token", validateBody(resetPasswordSchema), resetPassword);

export default authRouter;