export const ZOHO_AUTH_URL = "https://accounts.zoho.com/oauth/v2/auth";
export const ZOHO_TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";

// ======= CLAUDINARY CONSTANTS =======
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

// Size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total

// Maximum number of files
export const MAX_FILES = 20;

// ======= EMAIL CONFIG (safe for client) =======
export const EMAIL_CONFIG = {
  fromEmail: "onboarding@resend.dev",
  fromName: "Combilift Sales",
  testEmail: "anyeloisaacbenavide@gmail.com",
} as const;

export const NOTIFICATION_CONFIG = {
  visitCompleted: {
    recipients: [EMAIL_CONFIG.testEmail],
    enabled: true,
  },
} as const;
