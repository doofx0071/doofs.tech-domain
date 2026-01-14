import { EmailLayout } from "./layout";

export const DomainClaimedTemplate = (subdomain: string, rootDomain: string) => {
    const fullDomain = `${subdomain}.${rootDomain}`;
    const title = "Domain Claimed";
    
    const content = `
        <p>Success!</p>
        <p>You have successfully claimed <strong>${fullDomain}</strong>.</p>
        <p>This domain is now reserved for your account. You can configure DNS records (A, CNAME, TXT, etc.) directly from your dashboard.</p>
        <p>Changes typically propagate globally within minutes.</p>
    `;

    return EmailLayout(title, content, {
        label: "Manage DNS Records",
        url: "https://domain.doofs.tech/dashboard/domains"
    });
};
