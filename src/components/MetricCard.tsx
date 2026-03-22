import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className
}) => {
  return (
    <div className={clsx("metric-card glass-panel", className)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm text-slate-400 font-medium">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {value}
      </div>
      {(subtitle || trend !== undefined) && (
        <div className="flex items-center text-sm mt-2">
          {trend !== undefined && (
            <span
              className={clsx(
                "font-medium mr-2",
                trend >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
