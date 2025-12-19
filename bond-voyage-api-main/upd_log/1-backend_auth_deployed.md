Login, Sign up, and Forgot/Reset Password Authentication with OTP ✅

1. Base Configuration

    Base URL: https://bond-voyage-api.onrender.com/api/v1

    Health Check: GET /health (Returns 200 OK)

    Note on Latency: Since we are on the free tier, the server "sleeps" after 15 minutes of inactivity. The first request you make might take 30-50 seconds to load. Please be patient on the first hit; it will be fast afterwards.

    Note on OTP: Free tier on Resend limits the email sent only to the registered email. Use my email "felixangelomelgar5@gmail.com" for testing and I will send the OTP ASAP

2. Auth Endpoints (Contract)

    Sign Up: POST /auth/register

        Payload: { "email": "...", "password": "...", "firstName": "...", "lastName": "...", "phoneNumber": "..." }

    Login: POST /auth/login

        Payload: { "email": "...", "password": "..." }

        Note: This automatically sets a secure httpOnly cookie for session management.

    Logout: POST /auth/logout

3. Forgot Password Flow (3 Steps)

    Send OTP: POST /auth/send-otp -> { "email": "...", "firstName": "..." }

    Verify OTP: POST /auth/verify-otp -> { "email": "...", "otp": "..." }

    Reset Password: POST /auth/reset-password -> { "email": "...", "newPassword": "..." }