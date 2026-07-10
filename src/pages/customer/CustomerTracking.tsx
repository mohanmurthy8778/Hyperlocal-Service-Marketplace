
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useApp } from '../../context/AppContext';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Loader2, Navigation, Phone, MessageSquare, XCircle, MapPin, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const Directions = ({ providerLocation, customerLocation }: { providerLocation: google.maps.LatLngLiteral, customerLocation: google.maps.LatLngLiteral }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map, suppressMarkers: true }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    directionsService.route({
      origin: providerLocation,
      destination: customerLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then(response => {
      directionsRenderer.setDirections(response);
    });
  }, [directionsService, directionsRenderer, providerLocation, customerLocation]);

  return null;
};

export const CustomerTracking: React.FC = () => {
  const { id } = useParams();
  const { socket, isConnected } = useSocket();
  const { currentUser, bookings } = useApp();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [providerLocation, setProviderLocation] = useState<{lat: number, lng: number} | null>(null);
  
  
  // Real customer location if available, otherwise fallback
  const customerLocation = booking?.location || { lat: 12.9716, lng: 77.5946 };


  // initial load from state
  useEffect(() => {
    const existing = bookings.find(b => b.id === id);
    if (existing) {
      setBooking(existing);
    }
    // Also ask server for latest state
    if (socket && isConnected) {
      socket.emit('get_booking', { bookingId: id });
    }
  }, [id, bookings, socket, isConnected]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusUpdated = (b: any) => {
      if (b.id === id) {
        setBooking(b);
      }
    };

    const handleLocationUpdated = (data: any) => {
      if (data.bookingId === id) {
        setProviderLocation({ lat: data.latitude, lng: data.longitude });
      }
    };
    
    const handleBookingData = (b: any) => {
      if (b && b.id === id) {
         setBooking(b);
      }
    };

    socket.on('booking_status_updated', handleStatusUpdated);
    socket.on('location_updated', handleLocationUpdated);
    socket.on('booking_data', handleBookingData);

    return () => {
      socket.off('booking_status_updated', handleStatusUpdated);
      socket.off('location_updated', handleLocationUpdated);
      socket.off('booking_data', handleBookingData);
    };
  }, [socket, id]);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-secondary-text font-bold">Fetching Booking Details...</p>
      </div>
    );
  }

  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled' || booking.status === 'no_provider_found';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 relative h-[calc(100vh-64px)] flex flex-col gap-4">
      
      {/* Connection Status Header */}
      <div className="flex justify-between items-center bg-bg-card p-3 rounded-2xl border border-border-primary shadow-sm">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
             <MapPin className="h-4 w-4 text-primary" />
           </div>
           <div>
             <h1 className="text-sm font-bold text-primary-text">Live Tracking</h1>
             <p className="text-[10px] text-secondary-text">Booking #{booking.id}</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           {isConnected ? (
             <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] font-bold">
               <Wifi className="h-3 w-3" /> Connected
             </span>
           ) : (
             <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-[10px] font-bold">
               <WifiOff className="h-3 w-3" /> Disconnected
             </span>
           )}
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 rounded-3xl overflow-hidden border border-border-primary shadow-sm relative bg-bg-secondary">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-text bg-bg-card p-6 text-center">
            <MapPin className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold">Live Tracking Enabled</p>
            <p className="text-xs">Google Maps API key is required to render the map.</p>
            {providerLocation && (
              <p className="mt-4 text-[10px] text-primary">
                Provider coordinates: {providerLocation.lat.toFixed(4)}, {providerLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
        ) : (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultZoom={14}
              defaultCenter={customerLocation}
              mapId="tracking-map"
              disableDefaultUI={true}
            >
              <Marker position={customerLocation} title="You" />
              {providerLocation && (
                <Marker position={providerLocation} title="Provider" />
              )}
              {providerLocation && (
                <Directions providerLocation={providerLocation} customerLocation={customerLocation} />
              )}
            </Map>
          </APIProvider>
        )}
      </div>

      {/* Status Panel */}
      <div className="bg-bg-card p-5 rounded-3xl border border-border-primary shadow-xl shrink-0 space-y-4">
        
        <div className="flex items-center justify-between border-b border-border-primary pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-primary-text">{booking.serviceTitle}</h2>
            <p className="text-xs text-secondary-text">{booking.categoryName}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {booking.status === 'searching' && <Loader2 className="h-3 w-3 animate-spin" />}
              {booking.status === 'accepted' && <CheckCircle className="h-3 w-3" />}
              {booking.status === 'on_the_way' && <Navigation className="h-3 w-3" />}
              {booking.status.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {booking.status === 'searching' ? (
          <div className="py-6 text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-primary-text">Finding ServiceHub Providers...</h3>
            <p className="text-xs text-secondary-text mt-1">This usually takes less than a minute.</p>
          </div>
        ) : isCancelled ? (
          <div className="py-6 text-center">
             <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <XCircle className="h-8 w-8 text-rose-500" />
             </div>
             <h3 className="text-sm font-bold text-primary-text">
               {booking.status === 'no_provider_found' ? 'No Providers Available' : 'Booking Cancelled'}
             </h3>
             <p className="text-xs text-secondary-text mt-1">We couldn't assign a provider at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-bg-secondary p-3 rounded-2xl border border-border-primary">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-bg-card shrink-0">
                {booking.providerAvatar ? (
                  <img src={booking.providerAvatar} alt={booking.providerName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-lg font-bold text-primary">
                    {booking.providerName?.charAt(0) || 'P'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary-text truncate">{booking.providerName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-secondary-text flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Arriving soon
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button className="h-10 w-10 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-secondary-text hover:text-primary hover:border-primary/30 transition-colors shadow-sm">
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cancel option if not completed */}
            {!isCompleted && (
               <button 
                 onClick={() => {
                   if(socket) socket.emit('update_booking_status', { bookingId: booking.id, status: 'cancelled' })
                 }}
                 className="w-full py-3 bg-bg-secondary hover:bg-rose-50 text-rose-500 font-bold text-xs rounded-xl transition-colors border border-transparent hover:border-rose-100"
               >
                 Cancel Booking
               </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
