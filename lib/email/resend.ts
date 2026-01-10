import { Resend } from "resend";

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY not configured - email sending disabled");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || "estimates@contractor-estimates.com",
  replyToEnabled: true,
};
