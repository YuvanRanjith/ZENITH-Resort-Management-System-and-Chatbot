type Tone = 'emerald' | 'champagne' | 'midnight' | 'red' | 'stone' | 'blue';

const toneClasses: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  champagne: 'bg-champagne-50 text-champagne-700 ring-champagne-200',
  midnight: 'bg-midnight-50 text-midnight-700 ring-midnight-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  stone: 'bg-stone-100 text-stone-700 ring-stone-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = 'stone', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
