import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className = "", variant = "dark", size = "md", href = "/" }: LogoProps) {
  const isLight = variant === "light";
  const sizeClasses = {
    sm: "h-8 text-lg",
    md: "h-10 text-2xl",
    lg: "h-14 text-3xl",
  };

  return (
    <Link href={href} className={`inline-flex items-center gap-2 group ${className}`} dir="ltr">
      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-tight font-sans ${
            isLight ? "text-white" : "text-[#0b1320]"
          } text-xl md:text-2xl`}
        >
          Cysle
        </span>
        <span
          className={`text-xs md:text-sm font-semibold tracking-wider ${
            isLight ? "text-purple-300" : "text-[#542cb7]"
          }`}
        >
          Egypt
        </span>
      </div>

      {/* Hanger icon */}
      <svg
        className={`w-8 h-8 md:w-9 md:h-9 ${
          isLight ? "text-purple-400" : "text-[#542cb7]"
        } transition-transform group-hover:scale-105`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hook */}
        <path
          d="M24 16C24 11.5817 27.5817 8 32 8C35.3137 8 38 10.6863 38 14C38 17.3137 35.3137 20 32 20H24"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Triangle Hanger Body */}
        <path
          d="M24 20L6 33.5C5 34.2 4.5 35.5 5 36.6C5.5 37.7 6.6 38.5 7.8 38.5H40.2C41.4 38.5 42.5 37.7 43 36.6C43.5 35.5 43 34.2 42 33.5L24 20Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Crossbar notch */}
        <line
          x1="12"
          y1="38"
          x2="36"
          y2="38"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
