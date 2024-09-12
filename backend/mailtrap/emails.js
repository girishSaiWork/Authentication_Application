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