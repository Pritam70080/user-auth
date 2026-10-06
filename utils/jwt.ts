import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AuthTokenPayload } from '../types/auth.js';

export function generateAccessToken(payload: AuthTokenPayload ): string {
    const ACCESSTOKEN_SECRET = process.env.ACCESSTOKEN_SECRET ?? "";
    const ACCESSTOKEN_EXPIRY = process.env.ACCESSTOKEN_EXPIRY ?? "15m";
    return jwt.sign(payload, ACCESSTOKEN_SECRET, {expiresIn: ACCESSTOKEN_EXPIRY} as SignOptions);
}
export function generateRefreshToken(payload: AuthTokenPayload ): string {
    const REFRESHTOKEN_SECRET = process.env.REFRESHTOKEN_SECRET ?? "";
    const REFRESHTOKEN_EXPIRY = process.env.REFRESHTOKEN_EXPIRY ?? "7d";
    return jwt.sign(payload, REFRESHTOKEN_SECRET, {expiresIn: REFRESHTOKEN_EXPIRY} as SignOptions);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, process.env.ACCESSTOKEN_SECRET ?? "") as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
    return jwt.verify(token, process.env.REFRESHTOKEN_SECRET ?? "") as AuthTokenPayload;
}