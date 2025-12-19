/**
 * OTP Email Template for BondVoyage
 *
 * This component shows the email design that would be sent to users
 * containing their OTP verification code.
 * Usage: This is meant to be rendered as HTML email content
 */

interface OTPEmailTemplateProps {
  recipientName: string;
  otpCode: string;
  recipientEmail: string;
}

export function OTPEmailTemplate({
  recipientName,
  otpCode,
  recipientEmail,
}: OTPEmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#F8FAFB",
        padding: "40px 20px",
      }}
    >
      {/* Main Email Container */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(10, 122, 255, 0.12)",
        }}
      >
        {/* Header with Gradient */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%)",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            BondVoyage
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 400,
              opacity: 0.95,
            }}
          >
            Your Travel Planning Companion
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "40px 32px" }}>
          {/* Greeting */}
          <h2
            style={{
              margin: "0 0 16px 0",
              color: "#1A2B4F",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            Hi {recipientName}! 👋
          </h2>

          <p
            style={{
              margin: "0 0 24px 0",
              color: "#64748B",
              fontSize: "15px",
              lineHeight: "24px",
            }}
          >
            Thank you for signing up with BondVoyage! To
            complete your account creation and start planning
            your dream adventures, please verify your email
            address using the code below.
          </p>

          {/* OTP Code Box */}
          <div
            style={{
              backgroundColor: "#F0F9FF",
              border: "2px solid #0A7AFF",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              margin: "32px 0",
            }}
          >
            <p
              style={{
                margin: "0 0 12px 0",
                color: "#64748B",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Your Verification Code
            </p>
            <div
              style={{
                fontSize: "40px",
                fontWeight: 700,
                color: "#0A7AFF",
                letterSpacing: "8px",
                fontFamily: "monospace",
                margin: "0",
              }}
            >
              {otpCode}
            </div>
            <p
              style={{
                margin: "12px 0 0 0",
                color: "#64748B",
                fontSize: "13px",
              }}
            >
              This code will expire in{" "}
              <strong>10 minutes</strong>
            </p>
          </div>

          {/* Instructions */}
          <div
            style={{
              backgroundColor: "#F8FAFB",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "32px",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                color: "#1A2B4F",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              How to verify:
            </h3>
            <ol
              style={{
                margin: "0",
                paddingLeft: "20px",
                color: "#64748B",
                fontSize: "14px",
                lineHeight: "24px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                Return to the BondVoyage sign-up page
              </li>
              <li style={{ marginBottom: "8px" }}>
                Enter the 6-digit code shown above
              </li>
              <li>Click "Verify & Create Account"</li>
            </ol>
          </div>

          {/* Security Notice */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#FFF7ED",
              border: "1px solid #FDBA74",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                lineHeight: "1",
              }}
            >
              🔒
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 4px 0",
                  color: "#1A2B4F",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Security Notice
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: "13px",
                  lineHeight: "20px",
                }}
              >
                Never share this code with anyone. BondVoyage
                will never ask for your verification code via
                phone, email, or social media.
              </p>
            </div>
          </div>

          {/* Didn't request this? */}
          <p
            style={{
              margin: "0",
              color: "#64748B",
              fontSize: "13px",
              lineHeight: "20px",
            }}
          >
            If you didn't request this code, you can safely
            ignore this email. Someone may have entered your
            email address by mistake.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#F8FAFB",
            padding: "32px",
            textAlign: "center",
            borderTop: "1px solid #E5E7EB",
          }}
        >
          {/* Feature Highlights */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                ✈️
              </div>
              <p
                style={{
                  margin: 0,
                  color: "#1A2B4F",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Smart Planning
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                🗺️
              </div>
              <p
                style={{
                  margin: 0,
                  color: "#1A2B4F",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Easy Itineraries
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                👥
              </div>
              <p
                style={{
                  margin: 0,
                  color: "#1A2B4F",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Collaboration
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "#E5E7EB",
              margin: "24px 0",
            }}
          />

          {/* Support Info */}
          <p
            style={{
              margin: "0 0 8px 0",
              color: "#64748B",
              fontSize: "13px",
            }}
          >
            Need help? Contact us at{" "}
            <a
              href="mailto:support@bondvoyage.com"
              style={{
                color: "#0A7AFF",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              support@bondvoyage.com
            </a>
          </p>

          {/* Copyright */}
          <p
            style={{
              margin: "16px 0 0 0",
              color: "#94A3B8",
              fontSize: "12px",
            }}
          >
            © 2025 BondVoyage. All rights reserved.
          </p>

          <p
            style={{
              margin: "8px 0 0 0",
              color: "#94A3B8",
              fontSize: "11px",
            }}
          >
            This email was sent to {recipientEmail}
          </p>
        </div>
      </div>

      {/* Extra padding at bottom */}
      <div style={{ height: "40px" }} />
    </div>
  );
}

/**
 * PLAIN TEXT VERSION (for email clients that don't support HTML)
 */
export function OTPEmailTemplatePlainText(
  recipientName: string,
  otpCode: string,
): string {
  return `
BondVoyage - Email Verification
================================

Hi ${recipientName}!

Thank you for signing up with BondVoyage! To complete your account creation and start planning your dream adventures, please verify your email address.

YOUR VERIFICATION CODE
----------------------
${otpCode}

This code will expire in 10 minutes.

HOW TO VERIFY:
1. Return to the BondVoyage sign-up page
2. Enter the 6-digit code shown above
3. Click "Verify & Create Account"

SECURITY NOTICE:
Never share this code with anyone. BondVoyage will never ask for your verification code via phone, email, or social media.

If you didn't request this code, you can safely ignore this email.

---

Need help? Contact us at bondvoyage.system@gmail.com

© 2025 BondVoyage. All rights reserved.
  `.trim();
}