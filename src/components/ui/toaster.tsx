import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { BadgeCheck, AlertOctagon, TriangleAlert, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start">
              {variant === "success" && <BadgeCheck className="h-5 w-5 mt-0.5 shrink-0" />}
              {variant === "destructive" && <AlertOctagon className="h-5 w-5 mt-0.5 shrink-0" />}
              {variant === "warning" && <TriangleAlert className="h-5 w-5 mt-0.5 shrink-0" />}
              {variant === "info" && <Info className="h-5 w-5 mt-0.5 shrink-0" />}
              
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

