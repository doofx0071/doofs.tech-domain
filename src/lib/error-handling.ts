/**
 * Error Handling Utilities
 * 
 * Provides a central way to format and clean error messages before they 
 * reach the user's screen.
 */

// Known patterns to strip from the message
const PREFIX_PATTERNS = [
    /^Uncaught Error:\s*/,
    /^Error:\s*/,
    /^\[.*?\]\s*/, // Removes things like "[CONVEX ...]"
];

const TECHNICAL_JUNK = [
    /at async handler.*/,
    /at handler.*/,
    /at .*convex\/.*ts:\d+:\d+/,
];

/**
 * Formats an error object or string into a user-friendly message.
 */
export function formatError(error: any): string {
    if (!error) return "An unexpected error occurred.";

    let message = "";

    // Extract message from various error shapes
    if (typeof error === "string") {
        message = error;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (error.message) {
        message = error.message;
    } else if (error.error) {
        message = error.error; // Sometimes APIs return { error: "..." }
    } else {
        return "An unexpected error occurred. Please try again.";
    }

    // 1. Strip technical prefixes
    for (const pattern of PREFIX_PATTERNS) {
        message = message.replace(pattern, "");
    }

    // 2. Remove stack trace junk (if it leaked into the message)
    for (const pattern of TECHNICAL_JUNK) {
        message = message.replace(pattern, "");
    }

    // 3. Clean up generic Convex "Uncaught Error" leftovers
    if (message.includes("Uncaught Error")) {
        message = message.replace("Uncaught Error", "").trim();
    }
    
    // 4. Handle specific cloudflare JSON errors that might leak
    // e.g. "Cloudflare update failed: [{"code":1001,"message":"Content is invalid"}]"
    if (message.includes("Cloudflare") && message.includes("[{")) {
        try {
            // Try to extract the inner JSON message
            const match = message.match(/\[(.*?)\]/);
            if (match && match[1]) {
                const parsed = JSON.parse(`[${match[1]}]`);
                if (parsed[0] && parsed[0].message) {
                    return `Cloudflare: ${parsed[0].message}`;
                }
            }
        } catch (e) {
            // Fallback if parsing fails
            return "Unable to update DNS provider. Please check your input.";
        }
    }

    // 5. Final fallback for empty strings after cleaning
    if (!message.trim()) {
        return "An unexpected error occurred.";
    }

    return message.trim();
}
