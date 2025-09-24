import { cn } from "@/lib/utils";

interface PageLoaderProps {
  variant?: "spinner" | "dots" | "pulse" | "wave" | "bars" | "circle";
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
  overlay?: boolean;
}

export function PageLoader({
  variant = "spinner",
  size = "md",
  message = "Loading...",
  className,
  overlay = true,
}: PageLoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const containerClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-5",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const renderLoader = () => {
    const baseClasses = cn(sizeClasses[size], "animate-spin");
    const dotSize = size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-5 h-5";
    const barWidth = size === "sm" ? "w-1" : size === "md" ? "w-1.5" : size === "lg" ? "w-2" : "w-3";
    const waveHeight = size === "sm" ? "h-6" : size === "md" ? "h-8" : size === "lg" ? "h-12" : "h-16";

    switch (variant) {
      case "spinner":
        return (
          <div className={baseClasses}>
            <svg
              className="w-full h-full text-primary"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  dotSize,
                  "bg-primary rounded-full animate-bounce"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div className={cn(sizeClasses[size], "relative")}>
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
            <div className="relative bg-primary rounded-full w-full h-full animate-pulse" />
          </div>
        );

      case "wave":
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  barWidth,
                  waveHeight,
                  "bg-primary rounded-t-sm animate-pulse"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                  height: `${20 + (i % 3) * 10}px`,
                }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  barWidth,
                  waveHeight,
                  "bg-primary animate-pulse"
                )}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1.2s",
                }}
              />
            ))}
          </div>
        );

      case "circle":
        return (
          <div className={cn(sizeClasses[size], "relative")}>
            <div className="absolute inset-0 border-4 border-muted rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        containerClasses[size],
        className
      )}
    >
      {renderLoader()}
      {message && (
        <p
          className={cn(
            "text-muted-foreground font-medium animate-pulse",
            textSizes[size]
          )}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/10">
        {content}
      </div>
    );
  }

  return content;
}

// Example usage component
export function PageLoaderDemo() {
  const variants = ["spinner", "dots", "pulse", "wave", "bars", "circle"] as const;
  const sizes = ["sm", "md", "lg", "xl"] as const;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Page Loader Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {variants.map((variant) => (
            <div key={variant} className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <PageLoader 
                variant={variant} 
                size="lg" 
                message={variant.charAt(0).toUpperCase() + variant.slice(1)} 
                overlay={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Different Sizes (Spinner)</h2>
        <div className="grid grid-cols-4 gap-8">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
              <PageLoader 
                variant="spinner" 
                size={size} 
                message={`Size: ${size}`} 
                overlay={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <code className="text-sm">
              {`<PageLoader variant="spinner" size="md" message="Loading..." />`}
            </code>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <code className="text-sm">
              {`<PageLoader variant="dots" size="lg" message="Please wait..." overlay={false} />`}
            </code>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <code className="text-sm">
              {`<PageLoader variant="circle" size="xl" message="Loading your content" />`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}