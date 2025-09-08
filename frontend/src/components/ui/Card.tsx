import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div
    className={cn(
      'rounded-2xl bg-white dark:bg-[#13202b] border border-[#e1e9f5] dark:border-[#223242] shadow-sm dark:shadow-none transition hover:shadow-md',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cn('px-5 pt-4 pb-2 flex items-start justify-between gap-4', className)} {...rest}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...rest }) => (
  <h3
    className={cn(
  'text-[13px] font-semibold tracking-wide text-brand-text dark:text-brand-text uppercase',
      className
    )}
    {...rest}
  >{children}</h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div
    className={cn(
  'px-5 pb-5 space-y-3 text-sm text-soft leading-relaxed',
      className
    )}
    {...rest}
  >{children}</div>
);
