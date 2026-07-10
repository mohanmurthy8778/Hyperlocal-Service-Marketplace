import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { Navigation, Clock, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

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
    
    // Clear previous
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'localizedValues'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const route = routes[0];
        const newPolylines = route.createPolylines();
        newPolylines.forEach(p => p.setMap(map));
        polylinesRef.current = newPolylines;
        
        // Don't fitbounds on every single poll, only on first load ideally.
        // We'll skip fitBounds here to not disrupt user panning if they are watching.

        if (route.localizedValues) {
          const durationText = (route as any).localizedValues?.duration?.text;
          const distanceText = (route as any).localizedValues?.distance?.text;
          if (durationText && distanceText) {
            onUpdateETA(durationText, distanceText);
          }
        }
      }
    }).catch(console.error);

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination, onUpdateETA]);

  return null;
}

export const CustomerLiveTrackingMap: React.FC<{ bookingId: number, customerLocation: Location, onClose: () => void }> = ({ bookingId, customerLocation, onClose }) => {
  const [providerLocation, setProviderLocation] = useState<Location | null>(null);
  const [eta, setEta] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  
  // Interpolation state for smooth movement
  const [displayLocation, setDisplayLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Poll the backend every 5 seconds
    const fetchLocation = async () => {
      try {
        const res = await axios.get(`/api/bookings/${bookingId}/location`);
        if (res.data && res.data.latitude && res.data.longitude) {
          setProviderLocation({ lat: res.data.latitude, lng: res.data.longitude });
        }
      } catch (err) {
        console.error("Failed to fetch provider location", err);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Smooth animation interpolation
  useEffect(() => {
    if (!providerLocation) return;
    if (!displayLocation) {
      setDisplayLocation(providerLocation);
      return;
    }
    
    // Simple linear interpolation
    const startLat = displayLocation.lat;
    const startLng = displayLocation.lng;
    const endLat = providerLocation.lat;
    const endLng = providerLocation.lng;
    
    let startTime = performance.now();
    const duration = 2000; // Animate over 2s
    
    let animationFrame: number;
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;
      
      setDisplayLocation({ lat: currentLat, lng: currentLng });
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [providerLocation]);


  if (!hasValidKey) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-secondary/50 dark:bg-bg-card/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-bg-card p-6 rounded-2xl max-w-md w-full text-center">
          <h3 className="text-lg font-bold text-primary-text mb-2">Google Maps API Key Required</h3>
          <p className="text-sm text-secondary-text mb-4">Please configure your Google Maps Platform API key in the AI Studio Settings (Secrets) as GOOGLE_MAPS_PLATFORM_KEY to use live tracking.</p>
          <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg-secondary/50 dark:bg-bg-card/90 backdrop-blur-sm flex flex-col md:flex-row">
      <div className="flex-1 relative h-[60vh] md:h-full">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={customerLocation}
            defaultZoom={14}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={true}
          >
            {/* Customer Marker */}
            <AdvancedMarker position={customerLocation}>
              <Pin background="#F97316" glyphColor="#fff" borderColor="#EA580C">
                 <MapPin className="h-4 w-4 text-white" />
              </Pin>
            </AdvancedMarker>

            {/* Provider Marker */}
            {displayLocation && (
              <AdvancedMarker position={displayLocation}>
                <div className="h-10 w-10 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg transform transition-transform">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
              </AdvancedMarker>
            )}

            {displayLocation && (
              <RouteDisplay 
                origin={displayLocation} 
                destination={customerLocation} 
                onUpdateETA={(newEta, newDist) => {
                  setEta(newEta);
                  setDistance(newDist);
                }} 
              />
            )}
          </Map>
        </APIProvider>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-bg-card p-2 rounded-full shadow-lg text-primary-text hover:bg-bg-secondary dark:hover:bg-gray-700 z-10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="w-full md:w-96 bg-bg-card p-6 flex flex-col justify-end md:justify-start h-[40vh] md:h-full overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-primary-text tracking-tight">Provider En Route</h2>
          <p className="text-xs text-muted-text mt-1">Live location updating every 5 seconds</p>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-muted-text uppercase tracking-wider">Estimated Time</div>
              <div className="text-lg font-bold text-primary-text">{eta || 'Calculating...'}</div>
            </div>
          </div>

          <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-muted-text uppercase tracking-wider">Distance Remaining</div>
              <div className="text-lg font-bold text-primary-text">{distance || '...'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
