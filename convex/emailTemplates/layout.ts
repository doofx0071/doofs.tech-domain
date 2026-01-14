/**
 * Shared Email Layout
 * Professional Black & White Design
 */
export const EmailLayout = (title: string, content: string, cta?: { label: string, url: string }) => {
    // Use the production domain as the primary link source
    const siteUrl = "https://domain.doofs.tech";
    const logoUrl = `${siteUrl}/doofs.tech-lightmode-logo.png`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #000000;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #e5e5e5;
    }
    .header {
        border-bottom: 2px solid #000000;
        padding-bottom: 20px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .logo-img {
        height: 24px;
        vertical-align: middle;
        margin-right: 10px;
    }
    .content {
        min-height: 150px;
        margin-bottom: 40px;
        font-size: 16px;
    }
    .button-container {
        text-align: center;
        margin: 30px 0;
    }
    .button {
        display: inline-block;
        background-color: #000000;
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 24px;
        font-weight: bold;
        border-radius: 4px;
    }
    .footer {
        border-top: 2px solid #000000;
        padding-top: 20px;
        font-size: 12px;
        color: #666666;
        text-align: center;
    }
    .footer a {
        color: #000000;
        text-decoration: underline;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <img src="${logoUrl}" alt="Doofs Logo" class="logo-img">
                <span style="vertical-align: middle; font-weight: bold;">doofs.tech</span>
            </div>
            <div style="font-weight: bold;">${title}</div>
        </div>

        <div class="content">
            ${content}
            
            ${cta ? `
            <div class="button-container">
                <a href="${cta.url}" class="button">${cta.label}</a>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>Sent by <strong>doofs.tech</strong> - Professional Subdomain Management</p>
            <p>
                <a href="${siteUrl}/dashboard">Dashboard</a> • 
                <a href="${siteUrl}/contact">Contact</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
};
