import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Service } from '../types';
import { Heart, Star, Clock, MapPin, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../utils/format';
import { useTranslation } from '../utils/translations';

interface ServiceCardProps {
  service: Service;
  onCompareToggle?: (service: Service) => void;
  isComparing?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service,
  onCompareToggle,
  isComparing = false
}) => {
  const { favorites, toggleFavorite, users, language } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const isFav = favorites.includes(service.id);
  
  const provider = users.find((u) => u.id === service.providerId);
  const isVerified = provider?.isVerified !== false; // Default to true if not specified
  const experience = provider?.experience || '3 Years';
  
  // Deterministic mock availability and distance
  const numId = parseInt(service.id.replace(/\D/g, '')) || 3;
  const availability = numId % 2 === 0 ? t('availabilityToday') : t('availabilityWeek');
  
  const mockDistance = parseFloat((Math.abs((numId * 17) % 100) / 10 + 1.2).toFixed(1));

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-primary bg-bg-card shadow-sm hover:shadow-xl dark:border-border-primary dark:bg-bg-card transition-all duration-300"
      id={`service-card-${service.id}`}
    >
      {/* Top Banner & Images */}
      <div className="relative aspect-video w-full overflow-hidden bg-bg-secondary">
        <img
          src={service.images[0]}
          alt={service.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Compare Checkbox */}
        {onCompareToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle(service);
            }}
            className={`absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-all border cursor-pointer ${
              isComparing 
                ? 'bg-primary border-primary text-white shadow-sm' 
                : 'bg-black/60 border-transparent text-white hover:bg-black/80'
            }`}
          >
            <div className={`h-2.5 w-2.5 rounded-sm border flex items-center justify-center shrink-0 ${isComparing ? 'bg-bg-card border-white text-primary' : 'border-border-primary'}`}>
              {isComparing && <span className="text-[7px] font-bold leading-none text-primary">✔</span>}
            </div>
            <span>{isComparing ? 'Comparing' : 'Compare'}</span>
          </button>
        )}

        {/* Category Label */}
        <span className={`absolute top-3 rounded-full bg-bg-secondary/50 dark:bg-bg-card/80 px-3 py-1 text-[10px] font-extrabold text-primary-text dark:text-white uppercase tracking-wider backdrop-blur-sm ${onCompareToggle ? 'left-24' : 'left-3'}`}>
          {service.categoryName}
        </span>
        
        {/* Distance Badge */}
        <span className="absolute left-3 bottom-3 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-black text-white shadow-sm">
          {mockDistance} km away
        </span>

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(service.id);
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bg-card shadow-md transition-all hover:scale-115 ${isFav ? 'text-red-500 bg-bg-card' : 'text-secondary-text hover:text-red-500 bg-bg-card/95'}`}
          id={`fav-btn-${service.id}`}
          title={isFav ? t('removeFavorite') : t('addToFavorites')}
        >
          <Heart className="h-5 w-5" fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : 'currentColor'} />
        </button>
      </div>

      {/* Content Details */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Provider Profile Line */}
        <div className="flex items-center gap-2 mb-3 bg-bg-secondary/50 p-2 rounded-xl border border-border-primary">
          <img
            src={service.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={service.providerName}
            className="h-7 w-7 rounded-full object-cover border border-white dark:border-border-primary shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-primary-text truncate">
                {service.providerName}
              </span>
              {isVerified && (
                <ShieldCheck className="h-3.5 w-3.5 text-accent fill-accent/10 shrink-0" title="Verified Professional" />
              )}
            </div>
            <span className="text-[10px] text-secondary-text leading-none">
              {experience} {t('experience')}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-0.5 bg-bg-card px-2 py-0.5 rounded-lg border border-border-primary shadow-2xs shrink-0">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-extrabold text-primary-text">
              {service.rating}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-primary-text line-clamp-1 group-hover:text-primary transition-colors">
          <Link to={`/service/${service.id}`} id={`service-title-link-${service.id}`}>
            {service.title}
          </Link>
        </h3>

        {/* Description Snippet */}
        <p className="mt-1.5 text-xs text-secondary-text line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Info Rows */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-y border-border-primary py-3 text-[11px] font-bold text-secondary-text">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{service.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate text-primary-text">{availability}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 text-[10px]">
             <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               Responds in {10 + (numId % 20)} mins
             </span>
          </div>
        </div>

        {/* Footer/Price and Book button */}
        <div className="mt-5 flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block leading-none mb-1">
              {t('startingPrice')}
            </span>
            <span className="text-xl font-black text-primary-text">
              {formatINR(service.price)}
            </span>
          </div>
          <button
            onClick={() => navigate(`/service/${service.id}`)}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-extrabold text-primary-text bg-accent hover:bg-accent-hover transition-all duration-200 shadow-md shadow-accent/20 hover:shadow-accent/30 active:scale-95 cursor-pointer"
            id={`book-now-btn-${service.id}`}
          >
            <span>{t('bookNow')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
