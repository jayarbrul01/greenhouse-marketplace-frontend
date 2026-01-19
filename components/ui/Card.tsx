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
        // border-gray-900/80 
        border-green-500/60 
        border-2 
        bg-black/95 
        backdrop-blur-xl 
        shadow-2xl 
        shadow-black/50
        p-5
        sm:p-6
        lg:p-7
        text-white 
        ${className}
      `}>
        {title ? <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2> : null}
        <div className={title ? "mt-3 sm:mt-4" : ""}>{children}</div>
      </div>
    );
  }
  