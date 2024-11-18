import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE , PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTeamplate.js";
import { mailtrapClient, mailtrapSender } from "./mailtrap_config.js";

export const sendVerificationEmail = async (email, verificationCode) => {
    const recipient = [{email}]

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
    const recipient = [{email}]

    try {
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,  // Use mailtrapSender instead of sender
            to: recipient,  // Use recipient instead of recipients
            template_uuid: "e919b167-3eef-4924-9ff6-5d9211aab9d2",
            template_variables: {
              "company_info_name": "AI Catalyst",
              "name": name
            }
        });

        console.log("Welcome email sent successfully:", emailResponse);

    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
}

export const sendResetPasswordEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const recipient = [{email}]
    try{
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "password-reset"
        });

        console.log("Reset email sent successfully:", emailResponse);

    }
    catch (error) {
        console.error("Error sending reset password email:", error);
        throw error;
    }
}

export const sendPasswordResetSuccessEmail = async (email, name) => {
    const recipient = [{email}]
    try{
        const emailResponse = await mailtrapClient.send({
            from: mailtrapSender,
            to: recipient,
            subject: "Password Reset Success",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "password-reset-success"
        });

        console.log("Password reset success email sent successfully:", emailResponse);

    }
    catch (error) {
        console.error("Error sending password reset success email:", error);
        throw error;
    }
}