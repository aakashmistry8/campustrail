import React from 'react';

interface CitySelectorProps {
  cities?: { key: string; name: string; image: string }[];
  onSelect?: (key: string) => void;
}

const defaultCities = [
  { key: 'delhi', name: 'Delhi', image: 'https://images.sharepal.in/cities/delhi.svg' },
  { key: 'mumbai', name: 'Mumbai', image: 'https://images.sharepal.in/cities/mumbai.svg' },
  { key: 'bangalore', name: 'Bangalore', image: 'https://images.sharepal.in/cities/bangalore.svg' },
  { key: 'hyderabad', name: 'Hyderabad', image: 'https://images.sharepal.in/cities/hyderabad.svg' },
  { key: 'chennai', name: 'Chennai', image: 'https://images.sharepal.in/cities/chennai.svg' },
  { key: 'kolkata', name: 'Kolkata', image: 'https://images.sharepal.in/cities/kolkata.svg' },
];

export const CitySelector: React.FC<CitySelectorProps> = ({ cities = defaultCities, onSelect }) => {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Cities</h3>
      <div className="flex flex-wrap gap-2">
        {cities.map(c => (
          <button key={c.key} onClick={()=> onSelect?.(c.key)} className="px-3 py-1.5 rounded-full bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-medium text-soft transition">
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CitySelector;