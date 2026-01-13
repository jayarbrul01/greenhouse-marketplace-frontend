import { SelectHTMLAttributes } from "react";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Select({
  variant = "outline" as const,
  size = "md" as const,
  className = "",
  ...props
}: Props) {
  const base =
    "rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "border border-green-700 text-gray-900 hover:border-green-800",
    outline: "border border-gray-300 text-gray-900 hover:border-gray-400",
  };

  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  return (
    <select
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
