import { useCallback } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback((props: Toast) => {
    // Simple toast implementation using browser alerts for now
    const message = `${props.title}${props.description ? ": " + props.description : ""}`;
    
    if (props.variant === "destructive") {
      console.error(message);
    } else {
      console.log(message);
    }
    
    // In a real app, you'd use a toast library like react-hot-toast or sonner
  }, []);

  return { toast };
}
