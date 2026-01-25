import { clsx } from "clsx";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-2.5 rounded-apple border transition-all",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-danger focus:ring-danger"
            : "border-border hover:border-foreground/20",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-foreground/60">{helperText}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}



