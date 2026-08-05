'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isUp: boolean;
  };
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  subtitle,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between text-xs font-medium text-textSecondary uppercase tracking-wider">
        <span>{title}</span>
        {Icon && <Icon className="w-4 h-4 text-textSecondary" />}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-textPrimary tracking-tight">{value}</span>
        
        {trend && (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              trend.isUp
                ? 'bg-emerald-50 text-success'
                : 'bg-rose-50 text-danger'
            }`}
          >
            {trend.isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-textSecondary font-normal">{subtitle}</p>
      )}
    </div>
  );
};
