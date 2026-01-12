import { Request } from "express";
import { UserRole, User } from "@prisma/client";

export interface ApiResponse<T = any, M = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: M;
}

export interface TokenPayload {
  userId: string;
  email: string;
  mobile: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface RegisterDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobile: string;
  birthday?: string;
  employeeId?: string;
  email: string;
  password: string;
  role?: UserRole;
  companyName?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserUpdateDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  yearsInOperation?: number | null;
  companyName?: string | null;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// Profile Data Types for Login Response
export interface AdminProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  companyName: string;
  yearsInOperation: string;
  customerRating: string;
}

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export type ProfileData = AdminProfileData | UserProfileData;

export interface LoginResponse {
  accessToken: string;
  user: ProfileData;
}

export type IUser = User;
