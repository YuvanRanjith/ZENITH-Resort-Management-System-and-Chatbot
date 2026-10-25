import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 24, className = '', label }: SpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-stone-500 ${className}`} role="status">
      <Loader2 className="animate-spin" style={{ width: size, height: size }} />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function FullSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner size={28} label={label} />
    </div>
  );
}
