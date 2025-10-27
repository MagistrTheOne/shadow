import { Loader2Icon } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingState = ({
  title = "Loading...",
  description = "Please wait while we load your content.",
  size = "md",
  className
}: Props) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "size-6";
      case "lg":
        return "size-12";
      default:
        return "size-8 md:size-10";
    }
  };

  return (
    <div className={`flex flex-1 items-center justify-center px-8 py-6 ${className || ""}`}>
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
            <Loader2Icon className={`${getSizeClasses()} animate-spin text-primary`} />
          </div>

          <div className="flex max-w-[44ch] flex-col gap-y-2 text-center">
            <h6 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h6>
            <p className="text-sm md:text-base text-muted-foreground">{description}</p>
          </div>

          {/* прогресс бар */}
          <div className="h-1 w-40 md:w-56 overflow-hidden rounded-full bg-muted/60">
            <div className="h-full w-1/3 animate-pulse bg-primary/60" />
          </div>

          <span className="sr-only">Loading</span>
        </div>
      </div>
    </div>
  );
};
