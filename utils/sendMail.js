import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, token) => {
    try {
        //Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_SMTP_HOST,
            port: process.env.MAILTRAP_SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.MAILTRAP_SMTP_USER,
                pass: process.env.MAILTRAP_SMTP_PASSWORD
            }
        });
        //Verification URL
        const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;
        //Email content
        const mailOptions = {
            from: `"Authentication App" <test@gmail.com>`,
            to: email,
            subject: "Please verify your email address",
            text: `
            Thank you for registering! Please verify your email address to complete your registration.
            ${verificationUrl}
            This verification link will expire i 10 mins.
            If you did not create an account, Please ignore this this email.`,
            html: `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Welcome to Authentication App!</h2>
                        <p>Hello,</p>
                        <p>Thank you for signing up. To complete your registration, please click the link below to verify your email address:</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" 
                            style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Verify Your Email
                            </a>
                        </p>
                        <p>If you did not request this, please ignore this email.</p>
                        <p>Best regards,</p>
                        <p>Authentication App</p>
                    </div>
                </body>
            </html>`,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email send:  %s ", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending verification email", error);
        return false;
    }
}

export default sendVerificationEmail;