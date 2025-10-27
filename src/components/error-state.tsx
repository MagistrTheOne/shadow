import { AlertCircleIcon, RefreshCwIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type ErrorType = "network" | "auth" | "validation" | "server" | "unknown";

interface Props {
  title: string;
  description: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  showGoBack?: boolean;
  error?: Error;
}

export const ErrorState = ({
  title,
  description,
  errorType = "unknown",
  onRetry,
  showGoBack = true,
  error
}: Props) => {
  const router = useRouter();

  // Log error for monitoring
  if (error) {
    console.error(`ErrorState [${errorType}]:`, error);
  }

  const getErrorIcon = () => {
    switch (errorType) {
      case "network":
        return "🌐";
      case "auth":
        return "🔐";
      case "validation":
        return "⚠️";
      case "server":
        return "🔥";
      default:
        return <AlertCircleIcon className="size-8 md:size-10 text-red-500" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case "network":
        return "text-orange-500";
      case "auth":
        return "text-yellow-500";
      case "validation":
        return "text-blue-500";
      case "server":
        return "text-red-500";
      default:
        return "text-red-500";
    }
  };
  return (
    <div className="flex flex-1 items-center justify-center px-8 py-6">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="relative w-full max-w-md md:max-w-lg min-h-[220px] md:min-h-[260px]
                   rounded-2xl border bg-background/70 backdrop-blur-xl shadow-lg ring-1 ring-black/5"
      >
        {/* свет */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl
         [mask-image:radial-gradient(60%_60%_at_50%_0%,#000_40%,transparent)]
        bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-y-6 p-8 md:p-10">
          <div className="relative grid place-items-center">
            <div className="absolute inset-0 -m-3 rounded-full blur-xl opacity-40 bg-primary/20" />
            {typeof getErrorIcon() === "string" ? (
              <span className="text-4xl md:text-5xl">{getErrorIcon()}</span>
            ) : (
              getErrorIcon()
            )}
          </div>

          <div className="flex max-w-[44ch] flex-col gap-y-2 text-center">
            <h6 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h6>
            <p className="text-sm md:text-base text-muted-foreground">{description}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Try Again
              </Button>
            )}
            {showGoBack && (
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
