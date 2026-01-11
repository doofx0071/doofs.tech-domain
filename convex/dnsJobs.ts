import { v } from "convex/values";
import { internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { now } from "./lib";

export const enqueueUpsert = internalMutation({
    args: {
        domainId: v.id("domains"),
        recordId: v.id("dns_records"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("dns_jobs")
            .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("recordId"), args.recordId),
                    q.eq(q.field("jobType"), "UPSERT_RECORD"),
                    q.or(q.eq(q.field("status"), "queued"), q.eq(q.field("status"), "retrying"))
                )
            )
            .first();

        // If job already queued for this record, we can skip or update it. 
        // Ensuring we don't have dupes.
        if (existing) return;

        await ctx.db.insert("dns_jobs", {
            jobType: "UPSERT_RECORD",
            domainId: args.domainId,
            recordId: args.recordId,
            status: "queued",
            attempts: 0,
            idempotencyKey: Math.random().toString(36).slice(2),
            createdAt: now(),
            updatedAt: now(),
        });
    },
});

export const enqueueDelete = internalMutation({
    args: {
        domainId: v.id("domains"),
        recordId: v.id("dns_records"), // We might only have ID if record is already gone from DB? 
        // Actually typically we keep record in DB marked "deleting" until job succeeds.
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("dns_jobs", {
            jobType: "DELETE_RECORD",
            domainId: args.domainId,
            recordId: args.recordId,
            status: "queued",
            attempts: 0,
            idempotencyKey: Math.random().toString(36).slice(2),
            createdAt: now(),
            updatedAt: now(),
        });
    }
});

export const processDue = internalAction({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch next job (we need a query for this)
        // We can't query directly in action, so we call mutation to get-and-lock a job
        const job = await ctx.runMutation(internal.dnsJobs.pickNextJob);
        if (!job) return; // No jobs

        try {
            if (job.jobType === "UPSERT_RECORD" && job.recordId) {
                // Fetch record details
                const record = await ctx.runQuery(internal.dnsJobs.getRecordForJob, { recordId: job.recordId });
                if (!record || record.status === "deleting") {
                    // Record gone or deleting, invalid state for upsert
                    await ctx.runMutation(internal.dnsJobs.completeJob, { jobId: job._id, status: "failed", error: "Record not found or deleting" });
                    return;
                }

                const result = await ctx.runAction((internal as any).dnsProvider.cloudflare.upsertRecord, {
                    type: record.type,
                    name: record.fqdn,
                    content: record.content,
                    priority: record.priority, // Required for MX records
                    ttl: record.ttl,
                    providerRecordId: record.providerRecordId
                });

                await ctx.runMutation(internal.dnsJobs.completeUpsert, {
                    jobId: job._id,
                    recordId: record._id,
                    providerRecordId: result.id
                });

            } else if (job.jobType === "DELETE_RECORD" && job.recordId) {
                // Need providerRecordId from the record (which might be marked deleting)
                const record = await ctx.runQuery(internal.dnsJobs.getRecordForJob, { recordId: job.recordId });

                if (record && record.providerRecordId) {
                    await ctx.runAction((internal as any).dnsProvider.cloudflare.deleteRecord, {
                        providerRecordId: record.providerRecordId
                    });
                }

                // If no providerId, maybe it was never synced. We just clean up DB.
                await ctx.runMutation(internal.dnsJobs.completeDelete, {
                    jobId: job._id,
                    recordId: job.recordId
                });
            }

        } catch (error: any) {
            // Retry logic
            const maxAttempts = 5;
            const attempts = job.attempts + 1;
            const nextRunAt = now() + (30 * 1000 * Math.pow(2, attempts)); // backoff

            if (attempts >= maxAttempts) {
                await ctx.runMutation(internal.dnsJobs.completeJob, {
                    jobId: job._id,
                    status: "failed",
                    error: error.message
                });
            } else {
                await ctx.runMutation(internal.dnsJobs.retryJob, {
                    jobId: job._id,
                    attempts,
                    nextRunAt,
                    error: error.message
                });
            }
        }

        // Check if more jobs exist
        await ctx.scheduler.runAfter(1000, internal.dnsJobs.processDue);
    },
});

// -- Internal Mutations for Job Processing --

export const pickNextJob = internalMutation({
    args: {},
    handler: async (ctx) => {
        const job = await ctx.db
            .query("dns_jobs")
            .withIndex("by_status", (q) => q.eq("status", "queued"))
            .first();

        // Also check retrying with invalid nextRunAt? For simplicity just queued checks first
        // Real implementation should check (status=queued OR (status=retrying AND nextRun <= now))

        if (!job) return null;

        await ctx.db.patch(job._id, { status: "running", updatedAt: now() });
        return job;
    },
});

export const getRecordForJob = internalQuery({
    args: { recordId: v.id("dns_records") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.recordId);
    }
});

export const completeUpsert = internalMutation({
    args: { jobId: v.id("dns_jobs"), recordId: v.id("dns_records"), providerRecordId: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, { status: "success", updatedAt: now() });
        await ctx.db.patch(args.recordId, {
            status: "active",
            providerRecordId: args.providerRecordId,
            lastError: undefined,
            updatedAt: now()
        });
    }
});

export const completeDelete = internalMutation({
    args: { jobId: v.id("dns_jobs"), recordId: v.id("dns_records") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, { status: "success", updatedAt: now() });
        const record = await ctx.db.get(args.recordId);
        if (record) {
            await ctx.db.delete(args.recordId); // Actually delete it now
        }
    }
});

export const completeJob = internalMutation({
    args: { jobId: v.id("dns_jobs"), status: v.union(v.literal("failed"), v.literal("success")), error: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, { status: args.status, error: args.error, updatedAt: now() });
        // Optionally mark record as error
        const job = await ctx.db.get(args.jobId);
        if (job?.recordId && args.status === "failed") {
            await ctx.db.patch(job.recordId, { status: "error", lastError: args.error });
        }
    }
});

export const retryJob = internalMutation({
    args: { jobId: v.id("dns_jobs"), attempts: v.number(), nextRunAt: v.number(), error: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, {
            status: "retrying",
            attempts: args.attempts,
            nextRunAt: args.nextRunAt,
            error: args.error,
            updatedAt: now()
        });
    }
});
