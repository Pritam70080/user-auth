import type mongoose from "mongoose";
import type { Types } from "mongoose";

export type UserRole = "admin" | "user";

export interface UserDocumentData {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  role: UserRole;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiry?: Date | null;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends mongoose.Document, UserDocumentData {
  comparePassword(password: string): Promise<boolean>;
}
