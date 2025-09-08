import React from 'react';
import { SidebarNav } from './SidebarNav';
import { Navbar } from './Navbar';

interface LayoutShellProps {
  children: React.ReactNode;
  view: string;
  onNavigate: (v: any)=>void;
  dark: boolean;
  toggleDark: ()=>void;
  user: { email: string } | null;
  onAuthClick: ()=>void;
  onLogout: ()=>void;
  cartCount: number;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children, view, onNavigate, dark, toggleDark, user, onAuthClick, onLogout, cartCount }) => {
  return (
  <div className="app-shell flex flex-col">
      <Navbar current={view as any} onNavigate={onNavigate} dark={dark} toggleDark={toggleDark} user={user} onAuthClick={onAuthClick} onLogout={onLogout} cartCount={cartCount} />
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 py-8">
        <aside className="hidden md:block w-60 shrink-0">
          <SidebarNav current={view} onNavigate={onNavigate} />
        </aside>
        <main className="flex-1 min-w-0 pb-16 animate-fadeIn">
          {children}
        </main>
      </div>
  <footer className="px-6 py-10 text-xs text-faint border-t border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <p>CampusTrail &copy; {new Date().getFullYear()} – peer travel & gear platform (prototype).</p>
          <p className="text-[10px]">Experimental build. Data may reset. Do not use for production transactions.</p>
        </div>
      </footer>
    </div>
  );
};
