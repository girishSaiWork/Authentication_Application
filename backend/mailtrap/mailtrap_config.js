import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT || "https://send.api.mailtrap.io/api/v1/";

if (!TOKEN) {
    throw new Error('MAILTRAP_TOKEN is not set in environment variables');
}

export const mailtrapClient = new MailtrapClient({ 
    token: TOKEN,
    endpoint: ENDPOINT
});

export const mailtrapSender = {
    email: "mailtrap@demomailtrap.com",
    name: "Girish"
};
