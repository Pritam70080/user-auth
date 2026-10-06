declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL?: string;
    PORT?: string;
    MONGODB_URI?: string;
    ACCESSTOKEN_SECRET?: string;
    ACCESSTOKEN_EXPIRY?: string;
    REFRESHTOKEN_SECRET?: string;
    REFRESHTOKEN_EXPIRY?: string;
    MAILTRAP_SMTP_HOST?: string;
    MAILTRAP_SMTP_PORT?: string;
    MAILTRAP_SMTP_USER?: string;
    MAILTRAP_SMTP_PASSWORD?: string;
  }
}

export {};
