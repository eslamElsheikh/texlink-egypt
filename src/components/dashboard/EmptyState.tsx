import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E5EAF2] p-10 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#17233F]">{title}</h3>
      <p className="text-xs text-[#718096] max-w-sm leading-relaxed">
        {description}
      </p>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>{actionText}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>{actionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
