import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Serve light mode logo with stable URL
http.route({
  path: "/logo-light",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const storageId = process.env.LOGO_LIGHT_STORAGE_ID || "kg2f07w27gqfmhnat12h105hys7yt3a5";
    
    const blob = await ctx.storage.get(storageId as any);
    
    if (!blob) {
      return new Response("Logo not found", { status: 404 });
    }
    
    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }),
});

// Serve dark mode logo with stable URL
http.route({
  path: "/logo-dark",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const storageId = process.env.LOGO_DARK_STORAGE_ID || "kg29w6s9t5cjwbh1cz82g1has97yvfhe";
    
    const blob = await ctx.storage.get(storageId as any);
    
    if (!blob) {
      return new Response("Logo not found", { status: 404 });
    }
    
    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }),
});

export default http;
