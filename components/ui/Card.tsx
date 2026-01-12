export function Card({
    title,
    children,
    className = "",
  }: {
    title?: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={`rounded-2xl border border-gray-200/50 bg-white/90 backdrop-blur-sm shadow-lg p-6 text-gray-900 ${className}`}>
        {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : null}
        <div className={title ? "mt-4" : ""}>{children}</div>
      </div>
    );
  }
  