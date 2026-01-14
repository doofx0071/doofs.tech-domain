import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatError } from "@/lib/error-handling";

interface AsyncFeedbackOptions {
    title?: string;
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
                    title: options.title || "Success",
                    description: options.successMessage,
                    variant: "default", // or "success" if you have that variant
                });
            }

            if (options.onSuccess) {
                options.onSuccess(result);
            }
            
            return result;
        } catch (error: any) {
            // Error Handling
            const formattedMessage = formatError(error);
            
            toast({
                title: options.title || "Error",
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
