import React from 'react';
import { Compass, Package, Map, Users, Star, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

const groups: { label: string; items: { key: string; label: string; icon: any }[] }[] = [
  {
    label: 'Discover',
    items: [
      { key: 'home', label: 'Home', icon: Compass },
      { key: 'products', label: 'Gear', icon: Package },
      { key: 'itineraries', label: 'Itineraries', icon: Map },
      { key: 'companions', label: 'Companions', icon: Users }
    ]
  },
  {
    label: 'Manage',
    items: [
      { key: 'manage-gear', label: 'My Gear', icon: Wrench },
      { key: 'reviews', label: 'Reviews', icon: Star }
    ]
  }
];

interface SidebarNavProps {
  current: string;
  onNavigate: (v: any)=>void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ current, onNavigate }) => {
  return (
    <div className="h-full sticky top-20 space-y-8">
      {groups.map(g => (
        <div key={g.label}>
          <p className="px-3 mb-2 text-[11px] font-semibold tracking-wide text-faint uppercase">{g.label}</p>
          <ul className="space-y-1.5">
            {g.items.map(it => {
              const Icon = it.icon;
              const active = current === it.key;
              return (
                <li key={it.key}>
                  <button onClick={()=> onNavigate(it.key as any)} className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition group focus-ring', active ? 'bg-[rgba(5,100,255,0.12)] text-[var(--brand)] shadow-sm' : 'text-soft hover:bg-[rgba(5,100,255,0.06)] hover:text-[var(--brand-text)]')}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 opacity-70" />
                    <span className="truncate">{it.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
