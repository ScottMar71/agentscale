import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

/**
 * AgentScale logo mark — three ascending bars inside a rounded tile evoke
 * "agents at scale". Pure geometry so it stays crisp from 16px favicons up.
 */
export function LogoMark({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${APP_NAME} logo`}
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <defs>
        <linearGradient id="as-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#as-grad)" />
      <g fill="none" strokeLinecap="round">
        <path d="M9 21V17" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" />
        <path d="M16 21V13" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="3" />
        <path d="M23 21V9" stroke="var(--brand-accent)" strokeWidth="3" />
      </g>
    </svg>
  );
}

interface LogoProps extends React.ComponentProps<"div"> {
  /** Optional supporting line under the wordmark. */
  subtitle?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}

export function Logo({
  className,
  subtitle,
  markClassName,
  wordmarkClassName,
  ...props
}: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)} {...props}>
      <LogoMark className={markClassName} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-base font-semibold tracking-tight",
            wordmarkClassName
          )}
        >
          Agent<span className="text-brand-accent">Scale</span>
        </span>
        {subtitle && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
