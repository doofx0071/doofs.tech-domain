/**
 * Password Reset Email Template
 * Responsive design matching doofs.tech theme
 */

interface PasswordResetTemplateProps {
  userName: string;
  resetCode: string;
  expiryMinutes?: number;
}

export function generatePasswordResetEmail({
  userName,
  resetCode,
  expiryMinutes = 15,
}: PasswordResetTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <title>Reset Your Password - doofs.tech</title>
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
    
    .code-container {
      background: #f5f5f5;
      border: 2px solid #0052FF;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      margin: 32px 0;
    }
    
    .code-label {
      font-size: 14px;
      color: #7a7a7a;
      margin-bottom: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .code {
      font-size: 36px;
      font-weight: 800;
      color: #0052FF;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    
    .expiry {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    
    .expiry p {
      color: #856404;
      font-size: 14px;
      margin: 0;
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
      .code-container {
        background: #0a0a0a;
        border-color: #0052FF;
      }
      .code {
        color: #0052FF;
      }
      .expiry {
        background-color: #332200;
        border-left-color: #fbbf24;
      }
      .expiry p {
        color: #fbbf24;
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
      <h1 class="greeting">Hi ${userName},</h1>
      <p class="message">We received a request to reset your password for your doofs.tech account. Use the verification code below to complete the password reset process.</p>
      <div class="code-container">
        <div class="code-label">Your Reset Code</div>
        <div class="code">${resetCode}</div>
      </div>
      <div class="expiry">
        <p><strong>⏱️ This code will expire in ${expiryMinutes} minutes.</strong> For your security, please use it promptly.</p>
      </div>
      <p class="message">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
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

export function generatePasswordResetPlainText({
  userName,
  resetCode,
  expiryMinutes = 15,
}: PasswordResetTemplateProps): string {
  return `
Hi ${userName},

We received a request to reset your password for your doofs.tech account. Use the verification code below to complete the password reset process.

Your Reset Code: ${resetCode}

⏱️ This code will expire in ${expiryMinutes} minutes. For your security, please use it promptly.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated message from doofs.tech
© ${new Date().getFullYear()} doofs.tech. All rights reserved.
  `.trim();
}
