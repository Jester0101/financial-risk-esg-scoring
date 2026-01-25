import { clsx } from "clsx";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "elevated";
}

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-apple bg-white",
        {
          "border border-border": variant === "outline",
          "shadow-apple": variant === "default",
          "shadow-apple-lg": variant === "elevated",
        },
        className
      )}
    >
      {children}
    </div>
  );
}



