import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  color?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose' | 'slate';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    teal: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as LucideIcon;
    return <IconComp className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group min-w-0">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-2 min-w-0 leading-tight">
          {title}
        </span>
        {icon && (
          <div className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            {renderIcon()}
          </div>
        )}
      </div>
      <div className="mt-2 sm:mt-2.5 flex items-baseline justify-between gap-1 min-w-0">
        <span className="text-xl xs:text-2xl sm:text-3xl font-black text-navy-950 tracking-tight font-sans truncate">
          {value}
        </span>
        {trend && (
          <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
