import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { AdminNotificationTemplate } from "./emailTemplates/adminNotification";

/**
 * Send an email using Mailgun
 */
export const sendEmail = internalAction({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.MAILGUN_API_KEY;
        const domain = process.env.MAILGUN_DOMAIN;

        if (!apiKey || !domain) {
            console.warn("Mailgun API key or domain not configured. Skipping email.");
            return { success: false, error: "Configuration missing" };
        }

        // Get settings for "From" address (need to call internal query or mutation to get settings?)
        // Converting this to run internal Query to get settings might be complex inside Action.
        // Instead, we will pass "from" details or fetch them if possible. 
        // Ideally actions shouldn't call DB directly, but we can call an internal query.

        const settings = await ctx.runQuery(internal.settings.internalGetSettings);

        // Default from address
        const fromName = settings?.mailgunFromName || "Doofs Tech";
        const fromEmail = settings?.mailgunFromEmail || `noreply@${domain}`;
        const from = `${fromName} <${fromEmail}>`;

        const formData = new FormData();
        formData.append("from", from);
        formData.append("to", args.to);
        formData.append("subject", args.subject);
        formData.append("html", args.html);

        try {
            const response = await fetch(
                `https://api.mailgun.net/v3/${domain}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error("Mailgun error:", error);
                return { success: false, error };
            }

            return { success: true };
        } catch (e: any) {
            console.error("Failed to send email:", e);
            return { success: false, error: e.message };
        }
    },
});

/**
 * Helper to send admin notifications
 * Finds the first admin and sends them an email
 */
export const notifyAdmin = internalAction({
    args: {
        subject: v.string(),
        message: v.string(), // Plain text or partial HTML message content
    },
    handler: async (ctx, args) => {
        // Check if notification settings are enabled
        const settings = await ctx.runQuery(internal.settings.internalGetSettings);

        // Check specific flags based on subject context? 
        // Or just check if Mailgun is enabled overall.
        if (!settings?.mailgunEnabled) {
            return;
        }

        // Get Admin Email
        const adminUser = await ctx.runQuery(internal.admin.internalGetAllAdmins).then(admins => admins[0]);

        if (!adminUser || !adminUser.email) {
            console.warn("No admin email found to notify.");
            return;
        }

        const html = AdminNotificationTemplate(args.subject, args.message);

        await ctx.runAction(internal.emailService.sendEmail, {
            to: adminUser.email,
            subject: args.subject,
            html,
        });
    },
});
