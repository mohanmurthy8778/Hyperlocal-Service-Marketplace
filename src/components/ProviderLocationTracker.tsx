import React, { useState, useEffect, useRef } from 'react';

import { motion } from 'motion/react';
import { MapPin, Navigation, StopCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import axiosInstance from '../api/axios';

export const ProviderLocationTracker: React.FC<{ bookingId: number, isTrackingActive: boolean, onStopTracking: () => void }> = ({ bookingId, isTrackingActive, onStopTracking }) => {
  const [tracking, setTracking] = useState(isTrackingActive);
  const watchId = useRef<number | null>(null);
  const { toast } = useApp();
  const { socket } = useSocket();

  useEffect(() => {
    setTracking(isTrackingActive);
  }, [isTrackingActive]);

  useEffect(() => {
    if (tracking) {
      if ('geolocation' in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            if (socket) {
              axiosInstance.post(`/bookings/${bookingId}/location`, { latitude, longitude }).catch(console.error);
              socket.emit('update_location', {
                bookingId,
                latitude,
                longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading,
                speed: position.coords.speed
              });
            }
          },
          (error) => {
            console.error("Error watching position", error);
            toast('Location access is required to track your journey.', 'error');
            setTracking(false);
            onStopTracking();
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        toast('Geolocation is not supported by your browser.', 'error');
        setTracking(false);
        onStopTracking();
      }
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [tracking, bookingId]);

  if (!tracking) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center animate-pulse">
          <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-primary-text">Journey Started</h4>
          <p className="text-xs text-secondary-text">Sharing your live location with the customer</p>
        </div>
      </div>
      <button 
        onClick={() => { setTracking(false); onStopTracking(); }}
        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
      >
        <StopCircle className="h-4 w-4" /> Stop
      </button>
    </motion.div>
  );
};
