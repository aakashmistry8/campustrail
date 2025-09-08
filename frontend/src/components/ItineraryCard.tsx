import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock } from 'lucide-react';
import { getItineraryImage } from './itineraryImages';
import defaultImages from '../utils/defaultImages';
import { getLocalDestinationImage } from '../utils/localImageMap';

interface ItineraryCardProps {
  id: string;
  title: string;
  owner: string;
  date: string; // ISO
  start: string; // time
  end: string; // time
  seats: number;
  taken: number;
  stops: string[];
  interests: string[];
  onViewDetails?: (id: string) => void;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({
  id,
  title,
  owner,
  date,
  start,
  end,
  seats,
  taken,
  stops,
  interests,
  onViewDetails,
}) => {
  const seatsRemaining = seats - taken;
  return (
    <motion.div
      layout
      role="article"
      aria-labelledby={`itinerary-${id}-title`}
      tabIndex={0}
      className="card animate-fadeIn"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-media">
        {stops && stops.length > 0 ? (
          <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="225" fill="#e2e8f0"/>
            <polygon points="0,225 150,120 220,170 350,90 400,140 400,225" fill="#94a3b8"/>
            <circle cx="320" cy="70" r="30" fill="#f59e0b"/>
            <text x="200" y="110" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#1e293b">
              {title}
            </text>
            <text x="200" y="140" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">
              {stops[0]}
            </text>
          </svg>
        ) : (
          <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="225" fill="#e2e8f0"/>
            <polygon points="0,225 150,120 220,170 350,90 400,140 400,225" fill="#94a3b8"/>
            <circle cx="320" cy="70" r="30" fill="#f59e0b"/>
            <text x="200" y="110" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#1e293b">
              {title}
            </text>
          </svg>
        )}
      </div>
      <h3 id={`itinerary-${id}-title`} className="card-title">{title}</h3>
      <p className="card-meta line-clamp-2">
        {stops.slice(0, 3).join(' • ')}{stops.length > 3 ? '…' : ''}
      </p>
      
      <div className="mt-3 flex flex-col gap-1 text-[11px] text-soft">
        <div className="flex justify-between">
          <span className="font-semibold">Date</span>
          <span aria-label="date">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Guide</span>
          <span aria-label="organizer">{owner}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Seats</span>
          <span aria-label="seats" className="inline-flex items-center gap-1">
            {taken}/{seats} 
            <span className={seatsRemaining > 0 ? "text-emerald-600" : "text-rose-600"}>
              ({seatsRemaining > 0 ? `${seatsRemaining} left` : 'Full'})
            </span>
          </span>
        </div>
      </div>
      
      <div className="card-actions">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {interests.slice(0, 4).map(tag => (
            <span key={tag} className="badge" aria-label={`interest ${tag}`}>{tag}</span>
          ))}
        </div>
        <button 
          className="btn-primary w-full justify-center"
          onClick={() => onViewDetails?.(id)}
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default ItineraryCard;
