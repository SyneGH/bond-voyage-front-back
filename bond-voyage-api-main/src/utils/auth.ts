import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "@/types";

export class AuthUtils {
  static generateAccessToken(
    payload: Omit<TokenPayload, "iat" | "exp">
  ): string {
    const options: SignOptions = {
      expiresIn: (process.env.JWT_ACCESS_EXPIRE ||
        "14m") as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, options);
  }

  static generateRefreshToken(
    payload: Omit<TokenPayload, "iat" | "exp">
  ): string {
    const options: SignOptions = {
      expiresIn: (process.env.JWT_ACCESS_EXPIRE ||
        "14m") as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, options);
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as TokenPayload;
  }

  static generateTokenPair(payload: Omit<TokenPayload, "iat" | "exp">) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  public static generateResetToken(payload: { userId: string; email: string }): string {
    return jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' } // 15 minutes for password reset
    );
  }
}
