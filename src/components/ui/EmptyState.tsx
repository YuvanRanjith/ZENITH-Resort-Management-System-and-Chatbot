import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && (
        <div className="mb-4 w-14 h-14 rounded-full bg-champagne-50 text-champagne-500 flex items-center justify-center ring-1 ring-champagne-200">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-serif font-semibold text-midnight-800">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-stone-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
