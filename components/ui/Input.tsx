import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={[
        "w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
        "placeholder:text-gray-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
