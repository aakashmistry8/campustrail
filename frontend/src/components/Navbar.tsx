import React from 'react';
import { cn } from '../lib/utils';
import { Compass, Map, Users, Package, User, Moon, Sun } from 'lucide-react';

type ViewKey = 'home' | 'products' | 'itineraries' | 'companions' | 'cart' | 'auth' | 'profile' | 'gear' | 'manage-gear' | 'reviews' | 'manage-itineraries' | 'manage-companions';
interface NavbarProps {
  current: ViewKey;
  onNavigate: (view: ViewKey) => void;
  dark: boolean;
  toggleDark: () => void;
  user?: { email: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
  cartCount?: number;
}

const tabs: { key: ViewKey; label: string; icon: any }[] = [
  { key: 'products', label: 'Gear', icon: Package },
  { key: 'itineraries', label: 'Itineraries', icon: Map },
  { key: 'companions', label: 'Companions', icon: Users },
];

export const Navbar: React.FC<NavbarProps> = ({ current, onNavigate, dark, toggleDark, user, onAuthClick, onLogout, cartCount }) => {
  return (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(255,255,255,0.85)] dark:bg-[#101c27cc] border-b border-[var(--brand-border)] dark:border-[#223242]">
      <div className="container flex h-16 items-center gap-8">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
      <Compass className="w-6 h-6 text-[var(--brand)]" />
      <span className="font-semibold tracking-tight text-lg bg-gradient-to-r from-[var(--brand)] to-[var(--brand-accent)] text-transparent bg-clip-text">CampusTrail</span>
        </button>
        <nav className="flex items-center gap-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = current === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onNavigate(t.key)}
                className={cn('px-3 py-2 rounded-full flex items-center gap-2 text-[13px] font-medium transition', active ? 'bg-[rgba(5,100,255,0.12)] text-[var(--brand)]' : 'text-soft hover:bg-[rgba(5,100,255,0.08)] hover:text-[var(--brand-text)]')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={toggleDark} aria-label="Toggle dark mode" className="p-2 rounded-full hover:bg-[rgba(5,100,255,0.08)] focus-ring transition text-soft hover:text-[var(--brand-text)]">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-soft hidden sm:inline">{user.email}</span>
              <button onClick={onLogout} className="btn-brand text-xs px-4 py-2">Logout</button>
            </div>
          ) : (
            <button onClick={onAuthClick} className="btn-brand px-5 py-2 text-sm">Sign In</button>
          )}
          <button onClick={() => onNavigate('cart')} className={cn('relative px-3 py-2 rounded-full text-soft hover:text-[var(--brand-text)] focus-ring transition hover:bg-[rgba(5,100,255,0.08)]')} aria-label="Cart">
            Cart
            {cartCount && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--brand)] text-white text-[10px] leading-none font-semibold px-1.5 py-1 rounded-full shadow" aria-label={`${cartCount} items in cart`}>{cartCount}</span>
            )}
          </button>
          <button onClick={() => onNavigate('profile')} className={cn('relative p-2 rounded-full text-soft hover:text-[var(--brand-text)] hover:bg-[rgba(5,100,255,0.08)] focus-ring transition')} aria-label="Profile">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
