import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Users } from 'lucide-react';
import { getCompanionImage } from './companionImages';
import defaultImages from '../utils/defaultImages';
import { getLocalTravelerImage } from '../utils/localImageMap';

interface CompanionCardProps {
  id: string;
  name: string;
  interests: string[];
  trips: number;
  rating: number;
  bio: string;
  onConnect?: (id: string) => void;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
  id,
  name,
  interests,
  trips,
  rating,
  bio,
  onConnect,
}) => {
  return (
    <motion.div
      layout
      role="article"
      aria-labelledby={`companion-${id}-title`}
      tabIndex={0}
      className="card animate-fadeIn"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-media">
        <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="225" fill="#e5edff"/>
          <circle cx="200" cy="85" r="55" fill="#c7d2fe"/>
          <circle cx="200" cy="70" r="25" fill="#818cf8"/>
          <rect x="160" y="110" width="80" height="45" rx="5" fill="#818cf8"/>
          <text x="200" y="140" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#1e1b4b">
            {name}
          </text>
          <text x="200" y="170" font-family="Arial" font-size="14" text-anchor="middle" fill="#3730a3">
            {rating.toFixed(1)} ★
          </text>
        </svg>
      </div>
      <h3 id={`companion-${id}-title`} className="card-title">{name}</h3>
      <p className="card-meta line-clamp-2">{bio}</p>
      
      <div className="mt-3 flex flex-col gap-1 text-[11px] text-soft">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Rating</span>
          <span aria-label="rating" className="inline-flex items-center gap-1">
            {rating.toFixed(1)} <Compass className="size-3 text-primary" />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Experience</span>
          <span aria-label="experience">{trips} trips</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="badge">Available</span>
        </div>
      </div>
      
      <div className="card-actions">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {interests.slice(0, 5).map(tag => (
            <span key={tag} className="badge" aria-label={`interest ${tag}`}>{tag}</span>
          ))}
        </div>
        <button 
          className="btn-primary w-full justify-center"
          onClick={() => onConnect?.(id)}
        >
          Connect
        </button>
      </div>
    </motion.div>
  );
};

export default CompanionCard;
