// Run this with: npx ts-node test-tokens.ts
import jwt from 'jsonwebtoken';
import { AuthUtils } from '../../src/utils/auth'; // Adjust path to your auth.ts

// 1. Mock the Env Vars so the test runs in isolation
process.env.JWT_ACCESS_SECRET = 'access_secret';
process.env.JWT_REFRESH_SECRET = 'refresh_secret';
process.env.JWT_ACCESS_EXPIRE = '15m'; 
process.env.JWT_REFRESH_EXPIRE = '7d'; // <--- The distinct value we want to see

console.log("Generating tokens...");

const payload = { userId: "123", role: "USER", email: "test@example.com", mobile: "1234567890" };
const { accessToken, refreshToken } = AuthUtils.generateTokenPair(payload);

// 2. Decode them (without verifying signature, just to check payload)
const decodedAccess = jwt.decode(accessToken) as any;
const decodedRefresh = jwt.decode(refreshToken) as any;

console.log("------------------------------------------------");
console.log(`Access Token Exp:  ${new Date(decodedAccess.exp * 1000).toLocaleString()}`);
console.log(`Refresh Token Exp: ${new Date(decodedRefresh.exp * 1000).toLocaleString()}`);
console.log("------------------------------------------------");

if (decodedRefresh.exp > decodedAccess.exp) {
    console.log("✅ SUCCESS: Refresh token lasts longer than Access token.");
} else {
    console.log("❌ FAILURE: Tokens expire at the same time.");
}