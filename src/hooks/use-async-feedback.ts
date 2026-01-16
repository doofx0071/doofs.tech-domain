import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatError, isSessionError, isSuspendedError } from "@/lib/error-handling";

interface AsyncFeedbackOptions {
    title?: string; // @deprecated use successTitle
    successTitle?: string;
    errorTitle?: string;
    successMessage?: string;
    loadingMessage?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

/**
 * A hook to wrap async operations with standardized loading state,
 * error formatting, and toast notifications.
 * 
 * @example
 * const { execute, isLoading } = useAsyncFeedback(createRecord, {
 *   successMessage: "Record created!",
 *   onSuccess: () => setIsOpen(false)
 * });
 */
export function useAsyncFeedback<TArgs, TResult>(
    asyncFn: (args: TArgs) => Promise<TResult>,
    options: AsyncFeedbackOptions = {}
) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const execute = useCallback(async (args: TArgs) => {
        setIsLoading(true);
        
        // Optional: Show loading toast if operation is expected to be slow
        // (We generally rely on UI loading spinners, but sometimes a toast is nice)
        if (options.loadingMessage) {
           // We could trigger a loading toast here, but simple state is usually better for UI
        }

        try {
            const result = await asyncFn(args);
            
            // Success Handling
            if (options.successMessage) {
                toast({
                    title: options.successTitle || options.title || "Success",
                    description: options.successMessage,
                    variant: "success",
                });
            }

            if (options.onSuccess) {
                options.onSuccess(result);
            }
            
            return result;
        } catch (error: any) {
            // Special handling for session expiration - auto redirect to login
            if (isSessionError(error)) {
                toast({
                    title: "Session Expired",
                    description: "Your session has expired. Redirecting to login...",
                    variant: "destructive",
                });
                
                // Auto-redirect to login after brief delay
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
                
                if (options.onError) {
                    options.onError(error);
                }
                return null;
            }
            
            // Special handling for suspended accounts
            if (isSuspendedError(error)) {
                toast({
                    title: "Account Suspended",
                    description: "Your account has been suspended. Please contact support.",
                    variant: "destructive",
                });
                
                if (options.onError) {
                    options.onError(error);
                }
                return null;
            }
            
            // Generic error handling
            const formattedMessage = formatError(error);
            
            toast({
                title: options.errorTitle || "Error",
                description: formattedMessage,
                variant: "destructive",
            });

            if (options.onError) {
                options.onError(error);
            }
            
            // Re-throw if the caller needs to handle it too (rare with this pattern)
            // throw error; 
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [asyncFn, options, toast]);

    return {
        execute,
        isLoading
    };
}
