import React from "react";

interface CareDataLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  inverted?: boolean;
}

export const CareDataLogo: React.FC<CareDataLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
  inverted = false,
}) => {
  const sizeMap = {
    sm: { icon: "w-6 h-6", box: "w-7 h-7", text: "text-xs", sub: "text-[9px]" },
    md: { icon: "w-7 h-7", box: "w-8 h-8", text: "text-sm", sub: "text-[10px]" },
    lg: { icon: "w-9 h-9", box: "w-10 h-10", text: "text-lg", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* High-end Healthcare Cross + Pulse Node Icon */}
      <div
        className={`${currentSize.box} rounded-lg bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 p-0.5 shadow-md flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-400/40`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Medical Cross Base */}
          <rect x="13" y="6" width="6" height="20" rx="2" fill="white" fillOpacity="0.95" />
          <rect x="6" y="13" width="20" height="6" rx="2" fill="white" fillOpacity="0.95" />
          {/* Pulse / AI Intelligence Line overlay */}
          <path
            d="M5 16H10L12 11L15 21L18 12L20 18L22 16H27"
            stroke="#059669"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Node dots */}
          <circle cx="15" cy="21" r="1.6" fill="#10b981" />
          <circle cx="18" cy="12" r="1.6" fill="#10b981" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-bold tracking-tight ${
                inverted ? "text-white" : "text-foreground"
              } ${currentSize.text}`}
            >
              CareData
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide leading-none ${
                inverted
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/30"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              }`}
            >
              AI
            </span>
          </div>
          <span
            className={`${currentSize.sub} ${
              inverted ? "text-emerald-200/80" : "text-foreground-muted"
            } tracking-tight mt-0.5 font-medium`}
          >
            Healthcare Data Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
