import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Gem, Facebook, Instagram, Twitter } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-midnight-950 text-ivory-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" href="/" />
            <p className="mt-4 text-sm text-ivory-100/70 leading-relaxed max-w-xs">
              A curated luxury escape where the horizon meets hospitality. Every detail,
              crafted for serenity.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-ivory-100/80 hover:bg-champagne-500 hover:text-midnight-950 transition cursor-pointer"
                  aria-hidden
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-champagne-300 font-sans font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-ivory-100/80">
              <li><Link to="/" className="hover:text-champagne-300 transition">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-champagne-300 transition">Rooms & Suites</Link></li>
              <li><Link to="/availability" className="hover:text-champagne-300 transition">Availability</Link></li>
              <li><Link to="/about" className="hover:text-champagne-300 transition">About Zenith</Link></li>
              <li><Link to="/contact" className="hover:text-champagne-300 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-champagne-300 font-sans font-semibold mb-4">
              Sample Contact
            </h4>
            <ul className="space-y-3 text-sm text-ivory-100/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-champagne-300 mt-0.5" />
                <span>1 Zenith Coast Road<br />Sample District, IN 400001 <span className="text-ivory-100/40">(editable)</span></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-champagne-300" />
                <a href="tel:+910000000000" className="hover:text-champagne-300 transition">+91 00000 00000</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-champagne-300" />
                <a href="mailto:stay@example.com" className="hover:text-champagne-300 transition">stay@example.com</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-champagne-300 font-sans font-semibold mb-4">
              The Zenith Promise
            </h4>
            <p className="text-sm text-ivory-100/70 leading-relaxed">
              Elegant stays, impeccable service, and memories measured in moments.
              Discover your perfect escape with Zenith.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-champagne-300/90 text-xs">
              <Gem className="w-3.5 h-3.5" />
              <span className="tracking-[0.2em] uppercase">Member, Sample Hospitality Guild</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ivory-100/50">
          <p>© {new Date().getFullYear()} Zenith Resort Management System — Academic demonstration project. Sample details are editable.</p>
          <p className="flex items-center gap-2">
            <span>Staff?</span>
            <Link to="/staff/login" className="hover:text-champagne-300 transition">Employee Login</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
