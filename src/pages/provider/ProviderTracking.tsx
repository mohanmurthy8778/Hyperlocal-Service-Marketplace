import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useApp } from '../../context/AppContext';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Loader2, Navigation, Phone, MessageSquare, MapPin, CheckCircle, Clock, Play, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Location {
  lat: number;
  lng: number;
}

function RouteDisplay({ origin, destination, onUpdateETA }: { origin: Location, destination: Location, onUpdateETA: (eta: string, dist: string) => void }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    polylinesRef.current.forEach(p => p.setMap(null));
    
    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        const polyline = new google.maps.Polyline({
          path: result.routes[0].overview_path,
          strokeColor: '#0F766E', // primary
          strokeWeight: 4,
          strokeOpacity: 0.8,
        });
        polyline.setMap(map);
        polylinesRef.current.push(polyline);
        
        const leg = result.routes[0].legs[0];
        if (leg && leg.duration && leg.distance) {
          onUpdateETA(leg.duration.text, leg.distance.text);
        }
      }
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [origin, destination, routesLib, map]);

  return null;
}

export const ProviderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, currentUser, updateBookingInState, toast } = useApp();
  const { socket, isConnected } = useSocket();

  const [providerLoc, setProviderLoc] = useState<Location | null>(null);
  const [customerLoc, setCustomerLoc] = useState<Location | null>(null);
  const [etaInfo, setEtaInfo] = useState({ duration: '-- mins', distance: '-- km' });

  const booking = bookings.find(b => b.id === id);

  useEffect(() => {
    if (!booking) return;
    
    // Simulate Customer Location from booking info or default
    setCustomerLoc(booking.location || { lat: 12.9716, lng: 77.5946 });

    // Use HTML5 Geolocation to track provider's live location
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setProviderLoc(loc);
        if (socket && isConnected) {
          socket.emit('update_location', {
            bookingId: booking.id,
            providerId: currentUser?.id,
            latitude: loc.lat,
            longitude: loc.lng,
            heading: pos.coords.heading || 0,
            speed: pos.coords.speed || 0,
          });
        }
      },
      (err) => console.warn('Geolocation Error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [booking, socket, isConnected, currentUser]);

  if (!booking) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-secondary-text">Booking not found.</p>
      </div>
    );
  }

  const handleUpdateStatus = (status: string) => {
    if (socket && isConnected) {
      socket.emit('update_booking_status', { bookingId: booking.id, status });
      updateBookingInState({ ...booking, status });
      toast(`Status updated to \${status.replace('_', ' ')}`, 'success');
    }
  };

  const getActionButtons = () => {
    switch (booking.status) {
      case 'accepted':
        return (
          <button onClick={() => handleUpdateStatus('on_the_way')} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all">
            <span className="flex items-center gap-2"><Navigation className="h-5 w-5" /> Start Navigation</span>
            <span className="text-[10px] opacity-80 font-normal">Customer will be notified you're on the way</span>
          </button>
        );
      case 'on_the_way':
        return (
          <button onClick={() => handleUpdateStatus('arrived')} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all">
            <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Mark as Arrived</span>
            <span className="text-[10px] opacity-80 font-normal">You have reached the customer's location</span>
          </button>
        );
      case 'arrived':
        return (
          <button onClick={() => handleUpdateStatus('started')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all">
            <span className="flex items-center gap-2"><Play className="h-5 w-5" /> Start Service</span>
            <span className="text-[10px] opacity-80 font-normal">Begin the job</span>
          </button>
        );
      case 'started':
        return (
          <button onClick={() => handleUpdateStatus('completed')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all">
            <span className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Complete Service</span>
            <span className="text-[10px] opacity-80 font-normal">Job finished, ready for payment</span>
          </button>
        );
      case 'completed':
        return (
          <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" /> Service Completed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:flex-row">
      <div className="h-[40vh] md:h-full md:w-2/3 lg:w-3/4 relative bg-bg-card">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-secondary-text p-6 text-center">
            <p>Google Maps API Key missing. Live tracking requires a valid key.</p>
          </div>
        ) : (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={providerLoc || customerLoc || { lat: 12.9716, lng: 77.5946 }}
              defaultZoom={14}
              mapId="provider_tracking_map"
              disableDefaultUI={true}
            >
              {customerLoc && (
                <Marker position={customerLoc}>
                  <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                    <User className="h-5 w-5" />
                  </div>
                </Marker>
              )}
              {providerLoc && (
                <Marker position={providerLoc}>
                  <div className="bg-primary text-white p-2.5 rounded-full shadow-xl border-2 border-white relative">
                    <Navigation className="h-5 w-5 rotate-45" />
                    <span className="absolute -inset-2 rounded-full border border-primary animate-ping opacity-50" />
                  </div>
                </Marker>
              )}
              {providerLoc && customerLoc && booking.status === 'on_the_way' && (
                <RouteDisplay 
                  origin={providerLoc} 
                  destination={customerLoc} 
                  onUpdateETA={(duration, distance) => setEtaInfo({ duration, distance })}
                />
              )}
            </Map>
          </APIProvider>
        )}
      </div>

      <div className="flex-1 bg-bg-secondary dark:bg-bg-card flex flex-col h-full border-l border-border-primary overflow-y-auto">
        <div className="p-5 border-b border-border-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">Booking ID</span>
              <span className="text-sm font-bold text-primary-text">{booking.id}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
              {booking.status.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="flex gap-4 items-center mt-6">
            <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-primary-text truncate">{booking.customerName}</h2>
              <p className="text-sm text-secondary-text truncate">{booking.serviceTitle}</p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:\${booking.customerPhone || '0000000000'}`} className="h-10 w-10 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-primary-text hover:bg-primary/5 hover:text-primary transition-all">
                <Phone className="h-4 w-4" />
              </a>
              <button className="h-10 w-10 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-primary-text hover:bg-primary/5 hover:text-primary transition-all">
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="bg-bg-card rounded-2xl p-4 border border-border-primary space-y-4 mb-6">
            <div className="flex gap-3">
              <div className="mt-1 flex-shrink-0">
                <MapPin className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-text uppercase">Destination</span>
                <p className="text-sm font-semibold text-primary-text mt-0.5">{booking.address}</p>
              </div>
            </div>
            
            {booking.status === 'on_the_way' && (
              <div className="flex pt-4 border-t border-border-primary/60">
                <div className="flex-1 text-center border-r border-border-primary/60">
                  <span className="text-[10px] font-bold text-muted-text uppercase">Distance</span>
                  <div className="text-lg font-black text-primary-text mt-0.5">{etaInfo.distance}</div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] font-bold text-muted-text uppercase">ETA</span>
                  <div className="text-lg font-black text-emerald-500 mt-0.5">{etaInfo.duration}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 space-y-3">
            {getActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};
