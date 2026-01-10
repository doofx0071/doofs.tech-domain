import { query } from "./_generated/server";

/**
 * Get public URLs for logo images stored in Convex
 */
export const getLogoUrls = query({
  args: {},
  handler: async (ctx) => {
    // Storage IDs for the logo images
    const logoLightId = "kg2f07w27gqfmhnat12h105hys7yt3a5" as any;
    const logoDarkId = "kg29w6s9t5cjwbh1cz82g1has97yvfhe" as any;
    
    // Generate URLs
    const logoLightUrl = await ctx.storage.getUrl(logoLightId);
    const logoDarkUrl = await ctx.storage.getUrl(logoDarkId);
    
    return {
      logoLightUrl,
      logoDarkUrl,
    };
  },
});
