interface AccountActivityTemplateProps {
  userName: string;
  activityType: string;
  activityDetails: string;
  timestamp: string;
  location?: string;
  device?: string;
}

export function generateAccountActivityEmail({
  userName,
  activityType,
  activityDetails,
  timestamp,
  location,
  device,
}: AccountActivityTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <title>Account Activity - doofs.tech</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #4b5563;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      padding: 40px 20px;
      text-align: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .logo {
      width: 60px;
      height: 60px;
      display: inline-block;
      flex-shrink: 0;
    }
    
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: #000000;
      letter-spacing: -0.5px;
      font-family: 'Space Grotesk', monospace;
    }
    
    .logo-divider {
      color: #666666;
      margin: 0 4px;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
    }
    
    .message {
      font-size: 16px;
      color: #4a4a4a;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    
    .alert {
      padding: 16px;
      background: #fef3cd;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      margin: 20px 0;
    }
    
    .alert p {
      color: #856404;
      font-size: 14px;
      margin: 0;
    }
    
    .info-box {
      background: #f4f4f5;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .info-box p {
      margin: 8px 0;
    }
    
    .footer {
      background-color: #1a1a1a;
      color: rgba(255, 255, 255, 0.7);
      padding: 32px 30px;
      text-align: center;
      font-size: 14px;
    }
    
    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a1a1a;
        color: #d0d0d0;
      }
      .email-container {
        background-color: #1a1a1a;
      }
      .logo path {
        fill: #fefdfb !important;
      }
      .logo-text {
        color: #fefdfb;
      }
      .logo-divider {
        color: #999999;
      }
      .greeting {
        color: #f0f0f0;
      }
      .message {
        color: #d0d0d0;
      }
      .alert {
        background: #332200;
        border-left-color: #fbbf24;
      }
      .alert p {
        color: #fbbf24;
      }
      .info-box {
        background: #0a0a0a;
      }
      .info-box p {
        color: #d0d0d0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-container">
        <img class="logo" src="https://domain.doofs.tech/doofs.tech-darkmode-logo.png" alt="doofs.tech logo" width="60" height="60" style="display: block; max-width: 100%; height: auto; border: 0;" />
        <div class="logo-text">doofs.tech <span class="logo-divider">|</span> Domains</div>
      </div>
    </div>
    <div class="content">
      <h1 class="greeting">Security Alert</h1>
      <p class="message">We detected a password change on your account.</p>
      <div class="info-box">
        <p><strong>Date:</strong> ${timestamp}</p>
        <p><strong>Location:</strong> ${location || 'Unknown'}</p>
        <p><strong>Device:</strong> ${device || 'Unknown'}</p>
      </div>
      <div class="alert">
        <p><strong>Was this you?</strong> If you didn't make this change, please contact support immediately.</p>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from doofs.tech</p>
      <p style="margin-top: 16px; font-size: 12px;">© ${new Date().getFullYear()} doofs.tech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateAccountActivityPlainText({
  userName,
  activityType,
  activityDetails,
  timestamp,
  location,
  device,
}: AccountActivityTemplateProps): string {
  return `
Security Alert

We detected a password change on your account.

Date: ${timestamp}
Location: ${location || 'Unknown'}
Device: ${device || 'Unknown'}

Was this you? If you didn't make this change, please contact support immediately.

---
This is an automated message from doofs.tech
© ${new Date().getFullYear()} doofs.tech. All rights reserved.
  `.trim();
}
