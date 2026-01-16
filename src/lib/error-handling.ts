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
    /^\[.*?\]\s*/, // Removes things like "[CONVEX ...]" or "[Request ID: ...]"
    /^Server Error Called by client\s*/,
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
    
    // Clean up "Server Error Called by client" if it appears in the middle
    if (message.includes("Server Error Called by client")) {
        message = message.replace("Server Error Called by client", "").trim();
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

// ============================================
// AUTH / SESSION ERROR DETECTION
// ============================================

const SESSION_ERROR_PATTERNS = [
    /session expired/i,
    /must be logged in/i,
    /must be authenticated/i,
    /not authenticated/i,
    /\bunauthenticated\b/i,
    /please log in again/i,
    /please sign in/i,
    /login required/i,
];

const SUSPENDED_ERROR_PATTERNS = [
    /account has been suspended/i,
    /account has been banned/i,
    /\bsuspended\b/i,
    /\bbanned\b/i,
];

// User-specific queries that require authentication
const USER_SPECIFIC_QUERIES = [
    /domains:listMine/i,
    /profile:/i,
    /dns:listRecords/i,
    /dns:createRecord/i,
    /dns:updateRecord/i,
    /dns:deleteRecord/i,
    /apiKeys:/i,
    /users:me/i,
    /users:currentUser/i,
    /admin:/i,  // All admin queries require authentication
];

/**
 * Detects if an error is related to session expiration or missing authentication.
 */
export function isSessionError(error: Error | string | null | undefined): boolean {
    if (!error) return false;
    const message = typeof error === "string" ? error : error.message;
    
    // Check explicit session patterns
    if (SESSION_ERROR_PATTERNS.some(p => p.test(message))) return true;
    
    // Heuristic: generic "Server Error Called by client" or "Server Error" on Convex queries
    if (message.includes("Server Error Called by client") || message.includes("Server Error")) {
        // If message contains a Convex query/mutation/action pattern, treat as session error
        // Pattern: [CONVEX Q(...)] or [CONVEX M(...)] or [CONVEX A(...)]
        if (/\[CONVEX [QMA]\(/.test(message)) {
            return true;
        }
        
        // Also check our known user-specific query patterns
        if (USER_SPECIFIC_QUERIES.some(p => p.test(message))) return true;
    }
    
    return false;
}

/**
 * Detects if an error is related to a suspended or banned account.
 */
export function isSuspendedError(error: Error | string | null | undefined): boolean {
    if (!error) return false;
    const message = typeof error === "string" ? error : error.message;
    return SUSPENDED_ERROR_PATTERNS.some(p => p.test(message));
}

/**
 * Detects if an error is any auth-related error that requires user to re-authenticate.
 * Combines session expiration and account suspension detection.
 */
export function isAuthError(error: Error | string | null | undefined): boolean {
    return isSessionError(error) || isSuspendedError(error);
}
