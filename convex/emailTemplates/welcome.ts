import { EmailLayout } from "./layout";

export const WelcomeEmailTemplate = (name: string) => {
    const title = "Welcome";
    const displayName = name || "there";
    
    const content = `
        <p>Hi ${displayName},</p>
        <p>Welcome to <strong>doofs.tech</strong>! We're excited to have you on board.</p>
        <p>You now have access to our professional subdomain management platform. You can claim unique subdomains, manage DNS records, and secure your online presence instantly.</p>
        <p>To get started, log in to your dashboard and claim your first domain.</p>
    `;

    return EmailLayout(title, content, {
        label: "Go to Dashboard",
        url: "https://domain.doofs.tech/dashboard"
    });
};
