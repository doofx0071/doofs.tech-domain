# Mailgun API Documentation

## Overview
Mailgun is a powerful email API service for developers to send, receive, and track emails. This document contains key information for integrating Mailgun into your application.

## Authentication
Mailgun uses API key authentication. You can find your API key in your Mailgun Control Panel.

```bash
Authorization: Basic base64(api:YOUR_API_KEY)
```

## Sending Emails via API

### Basic Email Send
```bash
POST https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages
```

**Parameters:**
- `from`: Sender email address
- `to`: Recipient email address(es)
- `subject`: Email subject
- `text`: Plain text body
- `html`: HTML body

**Example cURL:**
```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
  -F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
  -F to=YOU@YOUR_DOMAIN_NAME \
  -F subject='Hello' \
  -F text='Testing some Mailgun awesomeness!'
```

## Email Templates

### Template API Endpoints

#### 1. Store a Template
```bash
POST https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/templates
```

**Parameters:**
- `name`: Template name (unique identifier)
- `description`: Template description (optional)
- `template`: HTML template content
- `tag`: Template version tag (optional)

**Example:**
```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/templates \
  -F name='my-template' \
  -F description='My awesome template' \
  -F template='<html>{{content}}</html>'
```

#### 2. Get Template
```bash
GET https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/templates/TEMPLATE_NAME
```

#### 3. Update Template
```bash
PUT https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/templates/TEMPLATE_NAME
```

#### 4. Delete Template
```bash
DELETE https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/templates/TEMPLATE_NAME
```

### Template Versions

Templates support versioning, allowing you to maintain multiple versions of the same template.

#### Create Template Version
```bash
POST https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/templates/TEMPLATE_NAME/versions
```

**Parameters:**
- `template`: HTML template content
- `tag`: Version tag
- `active`: Boolean (set as active version)

### Sending with Templates

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
  -F from='Sender <sender@YOUR_DOMAIN_NAME>' \
  -F to='recipient@example.com' \
  -F subject='Hello' \
  -F template='my-template' \
  -F h:X-Mailgun-Variables='{"name": "John", "action": "verify"}'
```

**Template Variables:**
- Use Handlebars syntax: `{{variable_name}}`
- Pass variables via `h:X-Mailgun-Variables` as JSON

## Template Best Practices

### 1. **Responsive Design**
- Use table-based layouts for email compatibility
- Mobile-first approach with media queries
- Inline CSS for maximum compatibility

### 2. **Template Structure**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Inline styles for compatibility */
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <!-- Content here -->
  </table>
</body>
</html>
```

### 3. **Variable Substitution**
```html
<h1>Hello, {{name}}!</h1>
<p>Your verification code is: <strong>{{code}}</strong></p>
<a href="{{action_url}}">Click here to proceed</a>
```

## Transactional Email Types

### 1. **Password Reset**
- Subject: "Reset Your Password"
- Include: Reset code/link, expiration time
- CTA: Clear reset button

### 2. **Email Verification**
- Subject: "Verify Your Email Address"
- Include: Verification code/link
- CTA: Verify button

### 3. **Welcome Email**
- Subject: "Welcome to [App Name]"
- Include: Getting started information
- CTA: Explore features

### 4. **Account Changes**
- Subject: "Your Account Has Been Updated"
- Include: What changed, when, how to revert
- Security: Always notify of password changes

## Template Limits

- **Max Templates per Domain**: 100
- **Max Versions per Template**: 10
- **Template Size Limit**: 100 KB
- **Variable Size**: No specific limit mentioned

## Logs & Tracking

### Event Webhooks
Mailgun can send webhooks for:
- `delivered`: Email successfully delivered
- `opened`: Email was opened
- `clicked`: Link was clicked
- `failed`: Delivery failed
- `complained`: Marked as spam

### Logs API
```bash
GET https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/events
```

**Parameters:**
- `begin`: Start date (RFC 2822 format)
- `end`: End date
- `ascending`: Boolean (default: false)
- `limit`: Number of results (max 300)
- `event`: Filter by event type

## Node.js Integration Example

```javascript
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

// Send with template
mg.messages.create('YOUR_DOMAIN_NAME', {
  from: "Sender <sender@YOUR_DOMAIN_NAME>",
  to: ["recipient@example.com"],
  subject: "Hello",
  template: "my-template",
  'h:X-Mailgun-Variables': JSON.stringify({
    name: "John Doe",
    code: "123456"
  })
})
.then(msg => console.log(msg))
.catch(err => console.error(err));
```

## Security Best Practices

1. **Store API keys securely** - Use environment variables
2. **Use HTTPS** - All API calls should use HTTPS
3. **Validate recipients** - Verify email addresses before sending
4. **Rate limiting** - Implement your own rate limiting
5. **Monitor logs** - Regularly check for failed deliveries

## Testing

### Test Mode
Add `o:testmode=yes` parameter to send emails without actually delivering them.

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
  -F from='Sender <sender@YOUR_DOMAIN_NAME>' \
  -F to='recipient@example.com' \
  -F subject='Test' \
  -F text='Testing' \
  -F o:testmode=yes
```

## Pricing Considerations

- **Free Tier**: Limited sends per month
- **Pay-as-you-go**: Based on volume
- **Dedicated IPs**: Available for higher tiers
- **Template storage**: Included in all plans

## Resources

- Official Documentation: https://documentation.mailgun.com
- API Reference: https://documentation.mailgun.com/docs/mailgun/api-reference/
- Templates Guide: https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/send-templates
- Help Center: https://help.mailgun.com

## Support

- Support Portal: Available in Mailgun Control Panel
- Community: Stack Overflow with `mailgun` tag
- Status Page: Check Mailgun service status
