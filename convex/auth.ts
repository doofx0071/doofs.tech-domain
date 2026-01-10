import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      // Redirect to the frontend after OAuth completes
      if (redirectTo) {
        return redirectTo;
      }
      return "http://localhost:8080/dashboard";
    },
  },
});
