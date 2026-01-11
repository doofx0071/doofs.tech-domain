import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);

    // Fetch connected accounts
    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    return { ...user, accounts };
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(userId, { hasCompletedOnboarding: true });

    // Notify Admin of new user
    // We utilize the scheduler to trigger the email action asynchronously
    await ctx.scheduler.runAfter(0, internal.emailService.notifyAdmin, {
      subject: "New User Registration",
      message: `A new user has completed onboarding.\nUser ID: ${userId}`
    });
  },
});
