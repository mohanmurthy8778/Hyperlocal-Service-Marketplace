import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Service } from '../types';

interface MapProps {
  services: Service[];
  locationQuery: string;
}

export const Map: React.FC<MapProps> = ({ services, locationQuery }) => {
  return (
    <div className="relative w-full h-[600px] lg:h-full bg-bg-secondary rounded-3xl overflow-hidden border border-border-primary shadow-inner flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]">
      <div className="absolute inset-0 bg-primary/5"></div>
      {/* Centered Map Pin for Location Query */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/30 animate-bounce">
          <Navigation className="h-5 w-5" />
        </div>
        <span className="mt-1 bg-bg-card dark:bg-charcoal px-2 py-0.5 rounded shadow text-[10px] font-bold text-primary-text">
          {locationQuery || 'Your Location'}
        </span>
      </div>

      {/* Scattered mock provider pins */}
      {services.slice(0, 5).map((service, index) => {
        // Pseudo-random positions based on index
        const top = 20 + ((index * 37) % 60);
        const left = 15 + ((index * 53) % 70);
        return (
          <div 
            key={service.id} 
            className="absolute flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 hover:z-10"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <div className="bg-bg-card dark:bg-charcoal text-primary border-2 border-primary p-1.5 rounded-full shadow-lg">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 absolute top-full mt-1 bg-bg-card dark:bg-charcoal px-2 py-1 rounded shadow-lg text-[10px] font-bold text-primary-text whitespace-nowrap transition-opacity pointer-events-none border border-border-primary">
              {service.title}
              <div className="text-secondary-text font-medium">★ {service.rating} ({service.reviews})</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
