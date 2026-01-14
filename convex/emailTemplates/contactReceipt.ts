import { EmailLayout } from "./layout";

export const ContactReceiptTemplate = (name: string, userMessage: string) => {
    const title = "Message Received";
    const displayName = name || "there";
    
    const content = `
        <p>Hi ${displayName},</p>
        <p>Thank you for contacting doofs.tech support. We have received your message and will get back to you shortly.</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 14px;"><strong>Your Message:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 4px; font-style: italic;">
            "${userMessage.replace(/\n/g, '<br>')}"
        </p>
    `;

    // No CTA button for receipt
    return EmailLayout(title, content);
};
