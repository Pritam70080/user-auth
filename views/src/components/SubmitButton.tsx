import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  busy?: boolean;
  children: ReactNode;
}

export function SubmitButton({ busy = false, children, ...buttonProps }: SubmitButtonProps) {
  return (
    <button
      {...buttonProps}
      type="submit"
      disabled={busy || buttonProps.disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#52654b] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#40513b] focus:outline-none focus:ring-4 focus:ring-[#52654b]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
