import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

// 1. Define the cleanup mutation
export const cleanupAuditLogs = internalMutation({
    args: {},
    handler: async (ctx) => {
        const retentionPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
        const cutoffTime = Date.now() - retentionPeriod;

        // Fetch old logs (limit to 1000 per run to avoid timeout)
        const oldLogs = await ctx.db
            .query("auditLogs")
            .withIndex("by_timestamp")
            .filter((q) => q.lt(q.field("timestamp"), cutoffTime))
            .take(1000);

        for (const log of oldLogs) {
            // Archive first
            await ctx.db.insert("archive_audit_logs", {
                originalId: log._id,
                userId: log.userId,
                action: log.action,
                details: log.details,
                metadata: log.metadata,
                timestamp: log.timestamp,
                status: log.status,
                archivedAt: Date.now(),
            });

            // Then delete
            await ctx.db.delete(log._id);
        }

        if (oldLogs.length > 0) {
            console.log(`Archived and cleaned up ${oldLogs.length} old audit logs.`);
        }
    },
});

crons.interval(
    "refresh-pending-domains",
    { minutes: 1 }, // Run every minute
    internal.platformDomains.pollPending
);

// 2. Schedule the cron job (Runs daily at midnight UTC)
crons.daily(
    "Cleanup Old Audit Logs",
    { hourUTC: 0, minuteUTC: 0 },
    internal.crons.cleanupAuditLogs,
);

export default crons;

// We need an internal mutation to find the pending domains and schedule the actions
// actually we can just invoke an internal action directly if we want, or an internal query -> internal action
// But crons usually call mutations or actions.
// Let's create an internal action in THIS file (or another) that finds pending, and then calls the check.
// Wait, we can't iterate inside a cron definiton easily.
// Let's make a new file `convex/crons.ts` that exports the cron definition AND the handler.

// Wait, better pattern:
// crons.ts -> calls internal.platformDomains.pollPending
// platformDomains.ts -> pollPending (internal action) -> queries db -> runs loop of checkStatus
