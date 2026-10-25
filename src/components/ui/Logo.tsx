import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
  href?: string;
  className?: string;
}

export function Logo({ variant = 'dark', href = '/', className = '' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-ivory-50' : 'text-midnight-900';
  const subColor = variant === 'light' ? 'text-champagne-300' : 'text-champagne-600';
  return (
    <Link to={href} className={`inline-flex items-center gap-2 group ${className}`} aria-label="Zenith home">
      <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-champagne-500/10 ring-1 ring-champagne-500/30 group-hover:ring-champagne-500/60 transition">
        <Gem className={`w-5 h-5 ${subColor}`} strokeWidth={1.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-xl tracking-[0.2em] font-semibold ${textColor}`}>ZENITH</span>
        <span className={`text-[0.6rem] tracking-[0.3em] uppercase ${subColor}`}>Elevating Every Stay</span>
      </span>
    </Link>
  );
}
