import type { JwtPayload } from "jsonwebtoken";
import type { UserRole } from "./user.js";

export interface AuthUser {
  id: string;
  role: UserRole
}

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: UserRole
}

export interface AuthenticatedRequest extends Express.Request {
  user?: AuthUser;
}
