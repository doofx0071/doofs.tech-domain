interface WelcomeEmailTemplateProps {
  userName: string;
  userEmail: string;
}

export function generateWelcomeEmail({
  userName,
  userEmail,
}: WelcomeEmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <title>Welcome to doofs.tech</title>
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
    
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #0052FF;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
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
      .button {
        background: #0052FF;
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
      <h1 class="greeting">Welcome aboard!</h1>
      <p class="message">Thanks for signing up for doofs.tech. We're excited to have you on board!</p>
      <p class="message">Get started by managing your domains:</p>
      <center>
        <a href="https://doofs.tech/dashboard" class="button">Go to Dashboard</a>
      </center>
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

export function generateWelcomePlainText({
  userName,
  userEmail,
}: WelcomeEmailTemplateProps): string {
  return `
Welcome aboard!

Thanks for signing up for doofs.tech. We're excited to have you on board!

Get started by managing your domains:
https://doofs.tech/dashboard

---
This is an automated message from doofs.tech
© ${new Date().getFullYear()} doofs.tech. All rights reserved.
  `.trim();
}
