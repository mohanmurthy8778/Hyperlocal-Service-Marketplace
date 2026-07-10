import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useProviderLocation } from '../hooks/useProviderLocation';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, IndianRupee } from 'lucide-react';

export const SocketManager: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { currentUser, updateBookingInState, bookings } = useApp();
  
  const activeJob = bookings.find(b => b.providerId === currentUser?.id && (b.status === 'accepted' || b.status === 'on_the_way' || b.status === 'started'));
  useProviderLocation(activeJob?.id || null);
  const navigate = useNavigate();
  
  const [incomingBooking, setIncomingBooking] = useState<any>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!socket || !currentUser) return;

    // Global listener for both customer and provider
    const handleStatusUpdated = (b: any) => {
      updateBookingInState(b);
    };
    socket.on('booking_status_updated', handleStatusUpdated);

    if (currentUser.role === 'provider') {
      const handleIncomingBooking = (b: any) => {
        setIncomingBooking(b);
        setCountdown(60);
      };
      
      const handleCancelIncomingBooking = (data: { id: string }) => {
        if (incomingBooking && incomingBooking.id === data.id) {
          setIncomingBooking(null);
        }
      };

      const handleAcceptedSuccess = (b: any) => {
        setIncomingBooking(null);
        navigate(`/provider/bookings`);
      };

      socket.on('incoming_booking', handleIncomingBooking);
      socket.on('cancel_incoming_booking', handleCancelIncomingBooking);
      socket.on('booking_accepted_success', handleAcceptedSuccess);

      return () => {
        socket.off('booking_status_updated', handleStatusUpdated);
        socket.off('incoming_booking', handleIncomingBooking);
        socket.off('cancel_incoming_booking', handleCancelIncomingBooking);
        socket.off('booking_accepted_success', handleAcceptedSuccess);
      };
    }
  }, [socket, currentUser, incomingBooking, navigate]);

  useEffect(() => {
    if (incomingBooking && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (incomingBooking && countdown === 0) {
      // Auto reject
      if (socket && currentUser) {
        socket.emit('reject_booking', { bookingId: incomingBooking.id, providerId: currentUser.id });
      }
      setIncomingBooking(null);
    }
  }, [incomingBooking, countdown, socket, currentUser]);

  if (!incomingBooking) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-bg-card p-6 rounded-3xl max-w-sm w-full relative z-10 border border-border-primary shadow-2xl flex flex-col gap-4"
        >
          <div className="text-center">
            <h3 className="text-lg font-extrabold text-primary-text mb-1">New Booking Request!</h3>
            <p className="text-xs text-secondary-text">Respond within {countdown}s</p>
          </div>

          <div className="bg-bg-secondary p-4 rounded-xl border border-border-primary space-y-3">
            <div>
              <span className="text-[10px] font-bold text-muted-text uppercase">Service</span>
              <p className="text-sm font-bold text-primary-text">{incomingBooking.serviceTitle}</p>
              <p className="text-xs text-secondary-text">{incomingBooking.categoryName}</p>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-muted-text uppercase block">Location</span>
                <p className="text-xs font-semibold text-primary-text">{incomingBooking.address}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-primary">
              <div>
                <span className="text-[10px] font-bold text-muted-text uppercase block">Customer</span>
                <p className="text-xs font-bold text-primary-text">{incomingBooking.customerName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-text uppercase block">Earnings</span>
                <div className="flex items-center justify-end text-emerald-500 font-bold">
                  <IndianRupee className="h-3 w-3" />
                  <span>{incomingBooking.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => {
                if (socket && currentUser) {
                  socket.emit('reject_booking', { bookingId: incomingBooking.id, providerId: currentUser.id });
                }
                setIncomingBooking(null);
              }}
              className="py-3 bg-bg-secondary hover:bg-rose-50 text-rose-500 hover:text-rose-600 border border-border-primary hover:border-rose-200 rounded-xl text-xs font-bold transition-all"
            >
              Reject
            </button>
            <button
              onClick={() => {
                if (socket && currentUser) {
                  socket.emit('accept_booking', { bookingId: incomingBooking.id, providerId: currentUser.id });
                }
              }}
              className="py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
            >
              Accept
            </button>
          </div>
          
          <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / 60) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
