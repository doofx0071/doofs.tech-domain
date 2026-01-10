import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "refresh-pending-domains",
    { minutes: 1 }, // Run every minute
    internal.platformDomains.pollPending
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
