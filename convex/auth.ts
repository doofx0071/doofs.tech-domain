import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      // Update lastLoginAt on every sign-in to reset session timeout
      // This ensures the custom session timeout in requireUserId() works correctly
      await ctx.db.patch(userId, {
        lastLoginAt: Date.now(),
      });
    },
    async redirect({ redirectTo }) {
      // Redirect to the frontend after OAuth completes
      if (redirectTo) {
        return redirectTo;
      }
      return redirectTo || process.env.SITE_URL || "http://localhost:5173";
    },
  },
});
