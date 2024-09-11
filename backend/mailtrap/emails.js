import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTeamplate.js";
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