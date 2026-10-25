import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, CalendarSearch, LogIn, UserCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/rooms', label: 'Rooms & Suites' },
  { to: '/availability', label: 'Availability' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { accountKind, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const transparent = location.pathname === '/' && !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        transparent
          ? 'bg-midnight-950/95'
          : 'bg-ivory-50/90 backdrop-blur-md shadow-soft border-b border-stone-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3.5">
          <Logo variant={transparent ? 'light' : 'dark'} />
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition ${
                    transparent
                      ? 'text-ivory-100/90 hover:text-ivory-50 hover:bg-white/10'
                      : 'text-midnight-700 hover:text-midnight-900 hover:bg-midnight-50'
                  } ${isActive ? (transparent ? 'text-ivory-50 underline decoration-champagne-400 decoration-2 underline-offset-4' : 'text-midnight-900 underline decoration-champagne-500 decoration-2 underline-offset-4') : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/availability" className="btn-ghost" aria-label="Check availability">
              <CalendarSearch className="w-4 h-4" /> Availability
            </Link>
            {user ? (
              <Link
                to={accountKind === 'staff' ? '/staff/dashboard' : '/customer/dashboard'}
                className="btn-gold"
              >
                <UserCircle className="w-4 h-4" />
                My Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-gold">
                <LogIn className="w-4 h-4" /> Login / Register
              </Link>
            )}
          </div>
          <button
            className={`lg:hidden p-2 rounded-full ${transparent ? 'text-ivory-50' : 'text-midnight-800'}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation" aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-ivory-50 border-t border-stone-100 shadow-soft animate-fade-in">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium rounded-xl transition ${isActive ? 'bg-midnight-900 text-ivory-50' : 'text-midnight-700 hover:bg-midnight-50'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/availability" className="btn-outline mt-2">
              <CalendarSearch className="w-4 h-4" /> Availability
            </Link>
            {user ? (
              <Link to={accountKind === 'staff' ? '/staff/dashboard' : '/customer/dashboard'} className="btn-gold mt-2">
                <UserCircle className="w-4 h-4" /> My Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-gold mt-2">
                <LogIn className="w-4 h-4" /> Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
