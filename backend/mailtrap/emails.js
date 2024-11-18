import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTeamplate.js";
import { mailtrapClient, mailtrapSender } from "./mailtrap_config.js";

export const sendVerificationEmail = async (email, verificationCode) => {
    const recipient = [{email}];
    try {
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: "Email Verification",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationCode),
            category: "email-verification"
        });

        console.log("Email sent successfully:", emailResponse);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}];
    try {
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: "Welcome to Our Platform",
            html: `<h1>Welcome ${name}!</h1><p>Thank you for joining our platform.</p>`,
            category: "welcome"
        });

        console.log("Welcome email sent successfully:", emailResponse);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
}

export const sendResetPasswordEmail = async (email, resetToken) => {
    if (!process.env.FRONTEND_URL) {
        throw new Error('FRONTEND_URL environment variable is not set');
    }
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const recipient = [{email}];

    try {
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "password-reset"
        });

        console.log("Reset email sent successfully:", emailResponse);
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw error;
    }
}

export const sendPasswordResetSuccessEmail = async (email, name) => {
    const recipient = [{email}];
    try {
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{name}", name),
            category: "password-reset-success"
        });

        console.log("Password reset success email sent:", emailResponse);
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw error;
    }
}