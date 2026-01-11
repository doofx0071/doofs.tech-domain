/**
 * Admin Notification Email Template
 * Simple Black & White Design
 */
export const AdminNotificationTemplate = (title: string, message: string) => {
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
    .logo-text {
        font-weight: bold;
        font-size: 20px;
        text-decoration: none;
        color: #000000;
    }
    .content {
        min-height: 200px;
        margin-bottom: 40px;
    }
    .footer {
        border-top: 2px solid #000000;
        padding-top: 20px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        color: #666666;
    }
    .logo-img {
        height: 24px;
        vertical-align: middle;
        margin-right: 10px;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <img src="https://domain.doofs.tech/doofs.tech-lightmode-logo.png" alt="Doofs Logo" class="logo-img">
                <span style="vertical-align: middle; font-weight: bold;">doofs.tech</span>
            </div>
            <div style="font-weight: bold;">Domains</div>
        </div>

        <div class="content">
            <h2 style="margin-top: 0;">${title}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
        </div>

        <div class="footer">
            <div style="font-weight: bold;">Domains</div>
            <div>doofs.tech by doof</div>
        </div>
    </div>
</body>
</html>
    `;
};
