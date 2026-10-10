import nodemailer, { type SendMailOptions } from "nodemailer";

const getFrontendUrl = () => (process.env.FRONTEND_URL ?? "http://localhost:5173").replace(/\/$/, "");

const mailTransport = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST ?? "smtp.mailtrap.io",
  port: Number(process.env.MAILTRAP_SMTP_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (options: SendMailOptions): Promise<boolean> => {
  try {
    const info = await mailTransport.sendMail(options);
    console.log("Verification email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email", error);
    return false;
  }
};

export const generateVerifyEmail = (email: string, token: string): SendMailOptions => {
  const verificationUrl = `${getFrontendUrl()}/verify/${token}`;

  return {
    from: '"Authentication App" <test@gmail.com>',
    to: email,
    subject: "Please verify your email address",
    text: `Thank you for registering! Please verify your email address to complete your registration. ${verificationUrl} This verification link will expire in 24 hours. If you did not create an account, please ignore this email.`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">Welcome to Authentication App!</h2>
            <p>Hello,</p>
            <p>Thank you for signing up. To complete your registration, please click the link below to verify your email address:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Email</a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Authentication App</p>
          </div>
        </body>
      </html>`,
  };
};

export const generateForgotPasswordEmail = (email: string, token: string): SendMailOptions => {
  const verificationUrl = `${getFrontendUrl()}/reset-password/${token}`;

  return {
    from: '"Authentication App" <test@gmail.com>',
    to: email,
    subject: "Reset your password",
    text: `We got a request to reset your password! Please verify your email address to complete your registration. ${verificationUrl} This verification link will expire in 5 minutes. If you did not request to change your password, please ignore this email.`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">Authentication App</h2>
            <p>Hello,</p>
            <p>We got a request to reset your password. To complete the process, please click the link below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Authentication App</p>
          </div>
        </body>
      </html>`,
  };
};