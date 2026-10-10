import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function FormField({ label, hint, id, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-stone-700">
          {label}
        </label>
      )}
      <input
        {...inputProps}
        id={inputId}
        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-[#73836c] focus:ring-4 focus:ring-[#52654b]/10 disabled:cursor-not-allowed disabled:bg-stone-50"
      />
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
