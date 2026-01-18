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
      <div className={`
        rounded-2xl 
        border 
        border-gray-700/50 
        border-t-green-500 
        border-r-green-500 
        border-t-2 
        border-r-2 
        bg-gray-800/90 
        backdrop-blur-sm 
        shadow-lg 
        p-5
        sm:p-6
        lg:p-7
        text-gray-100 
        ${className}
      `}>
        {title ? <h2 className="text-base sm:text-lg font-semibold text-gray-100">{title}</h2> : null}
        <div className={title ? "mt-3 sm:mt-4" : ""}>{children}</div>
      </div>
    );
  }
  