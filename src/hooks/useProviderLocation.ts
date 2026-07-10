import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import { useApp } from '../context/AppContext';

export const useProviderLocation = (activeBookingId: string | null) => {
  const { socket, isConnected } = useSocket();
  const { currentUser } = useApp();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !currentUser || currentUser.role !== 'provider' || !activeBookingId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          socket.emit('update_location', {
            bookingId: activeBookingId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        },
        (error) => {
          console.error("Error getting location", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [socket, isConnected, currentUser, activeBookingId]);
};
