import { useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Clock, MapPin, CreditCard, ChevronRight, MessageSquare, 
  AlertTriangle, CheckCircle, XCircle, FileText, CheckSquare, 
  Truck, Play, Trophy, Sparkles, CheckSquare as VerifiedIcon, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../utils/format';
import { useTranslation } from '../utils/translations';
import { useSocket } from '../hooks/useSocket';
import { ProviderLocationTracker } from './ProviderLocationTracker';
import { CustomerLiveTrackingMap } from './CustomerLiveTrackingMap';

interface BookingCardProps {
  booking: Booking;
  role: 'customer' | 'provider' | 'admin';
  onReviewClick?: (booking: Booking) => void;
  onComplaintClick?: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  role, 
  onReviewClick,
  onComplaintClick 
}) => {
  const { updateBookingStatus, toast, language, users } = useApp();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation(language);
  const [showLiveTracking, setShowLiveTracking] = useState(false);

  // Helper to fetch the active step (0 to 4)
  const getActiveStep = () => {
    switch (booking.status) {
      case 'searching':
      case 'pending':
        return 0;
      case 'accepted':
        return 1;
      case 'on_the_way':
      case 'arrived':
      case 'provider_notified':
        return 2;
      case 'started':
      case 'service_started':
        return 3;
      case 'completed':
        return 4;
      case 'rejected':
      case 'cancelled':
      case 'failed':
      case 'no_provider_found':
        return -1;
      default:
        return 0;
    }
  };

  const [currentStep, setCurrentStep] = useState(getActiveStep());

  // Sync state if booking.status changes from context
  useEffect(() => {
    setCurrentStep(getActiveStep());
  }, [booking.status]);

  const advanceStep = () => {
    let newStatus = '';
    if (booking.status === 'accepted') {
      newStatus = 'on_the_way';
      toast('Provider is now on the way!', 'success');
    } else if (booking.status === 'on_the_way') {
      newStatus = 'arrived';
      toast('Provider arrived!', 'success');
    } else if (booking.status === 'arrived') {
      newStatus = 'started';
      toast('Service has successfully started!', 'success');
    } else if (booking.status === 'started') {
      newStatus = 'completed';
      toast('Service is completed!', 'success');
    }

    if (newStatus && socket) {
      socket.emit('update_booking_status', { bookingId: booking.id, status: newStatus });
    } else if (newStatus) {
      updateBookingStatus(booking.id, newStatus as any);
    }
  };

  const getStatusStyles = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
      case 'searching':
        return 'bg-amber-55/15 text-amber-700 border-amber-200 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/40';
      case 'accepted':
      case 'on_the_way':
      case 'arrived':
      case 'started':
        return 'bg-primary/15 text-primary dark:bg-primary/5 dark:border-primary/20';
      case 'completed':
        return 'bg-emerald-55/15 text-emerald-700 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/40';
      case 'rejected':
        return 'bg-rose-55/15 text-rose-700 border-rose-200 dark:bg-rose-950/25 dark:text-rose-400 dark:border-rose-900/40';
      case 'cancelled':
      case 'no_provider_found':
        return 'bg-bg-secondary text-secondary-text border-border-primary dark:bg-bg-card dark:text-secondary-text dark:border-border-primary';
    }
  };

  const getPaymentStyles = (payStatus: Booking['paymentStatus']) => {
    switch (payStatus) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      case 'refunded':
        return 'bg-bg-secondary text-primary-text dark:bg-bg-card dark:text-secondary-text';
    }
  };

  // Steps configuration for our beautifully animated tracker
  const steps = [
    { label: t('bookingRequested'), icon: FileText },
    { label: t('providerAccepted'), icon: CheckSquare },
    { label: t('providerOnWay'), icon: Truck },
    { label: t('serviceStarted'), icon: Play },
    { label: t('completed'), icon: Trophy }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-border-primary bg-bg-card p-6 shadow-xs dark:border-border-primary dark:bg-bg-card transition-all duration-300 hover:shadow-lg hover:border-border-primary dark:hover:border-border-primary"
      id={`booking-card-${booking.id}`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary pb-4 dark:border-border-primary">
        <div>
          <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block">Booking ID</span>
          <span className="text-xs font-mono font-bold text-secondary-text">#{booking.id}</span>
        </div>
        <div className="flex gap-2">
          {/* Status Badge */}
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${getStatusStyles(booking.status)}`}>
            {booking.status.replace(/_/g, ' ')}
          </span>
          {/* Payment Status Badge */}
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${getPaymentStyles(booking.paymentStatus)}`}>
            <CreditCard className="h-3 w-3" />
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Booking Core Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-5">
        {/* Service and Provider / Customer */}
        <div className="md:col-span-2">
          <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block mb-1">Service & Partners</span>
          <h4 className="text-sm font-black text-primary-text leading-tight">{booking.serviceTitle}</h4>
          <p className="text-xs text-primary font-extrabold mt-0.5">{booking.categoryName}</p>

          <div className="flex items-center gap-2.5 mt-3.5 bg-bg-secondary/40 p-2 rounded-xl border border-border-primary">
            <img 
              src={role === 'customer' ? booking.providerAvatar : booking.customerAvatar} 
              alt="Avatar" 
              className="h-7 w-7 rounded-full object-cover border border-white dark:border-border-primary shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <span className="text-[9px] text-secondary-text block font-semibold leading-none mb-0.5">{role === 'customer' ? t('provider') : 'Customer'}</span>
              <span className="text-xs font-extrabold text-primary-text truncate block">
                {role === 'customer' ? booking.providerName : booking.customerName}
              </span>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-bg-secondary dark:bg-bg-card/15 p-3 rounded-2xl border border-border-primary dark:border-border-primary">
          <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block mb-2">Schedule</span>
          <div className="flex items-center gap-2 text-xs text-secondary-text mb-2 font-bold">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary-text font-bold">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>{booking.time}</span>
          </div>
        </div>

        {/* Price & Address */}
        <div>
          <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block mb-1">Financial & Place</span>
          <div className="text-lg font-black text-primary-text">{formatINR(booking.totalPrice)}</div>
          <div className="flex items-start gap-1.5 text-[11px] text-secondary-text dark:text-secondary-text mt-2 font-semibold">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{booking.address}</span>
          </div>
        </div>
      </div>

      {/* RENDER BOOKING STEPPER PROGRESS TRACKER */}
      {currentStep !== -1 && (
        <div className="my-6 bg-bg-secondary/50 dark:bg-bg-card/20 p-5 rounded-2xl border border-border-primary dark:border-border-primary">
          <span className="text-[10px] font-black text-secondary-text uppercase tracking-widest block mb-4 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>{t('bookingStatus')}</span>
          </span>
          
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-2">
            {/* Background Connector Bar (desktop only) */}
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200 dark:bg-bg-card hidden md:block -z-0" />
            
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              const isFuture = idx > currentStep;
              
              return (
                <div key={idx} className="flex md:flex-col items-center flex-1 relative z-10 gap-3 md:gap-0">
                  {/* Step Bubble circle */}
                  <motion.div 
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 md:mb-2 ${
                      isCompleted 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : isActive 
                        ? 'bg-bg-card border-primary text-primary dark:bg-bg-card shadow-md shadow-primary/10' 
                        : 'bg-bg-card border-border-primary text-secondary-text dark:bg-bg-card dark:border-border-primary'
                    }`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </motion.div>
                  
                  {/* Label details */}
                  <div className="flex flex-col md:items-center text-left md:text-center min-w-0">
                    <span className={`text-[10px] font-black uppercase tracking-wider leading-none mb-0.5 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-primary-text' : 'text-secondary-text'
                    }`}>
                      {isActive ? 'Active' : isCompleted ? 'Completed' : 'Upcoming'}
                    </span>
                    <span className={`text-[11px] font-extrabold ${
                      isActive ? 'text-primary-text' : 'text-secondary-text450'
                    } truncate max-w-[120px] md:max-w-none`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Row if Present */}
      {booking.notes && (
        <div className="bg-bg-secondary dark:bg-bg-card/50 rounded-xl p-3 mb-4 text-[11px] text-secondary-text italic font-semibold">
          <span className="font-extrabold uppercase text-[9px] text-secondary-text block not-italic mb-1">Instructions for Provider</span>
          "{booking.notes}"
        </div>
      )}

      {/* Review display if completed and reviewed */}
      {booking.rating && (
        <div className="border-t border-dashed border-border-primary dark:border-border-primary pt-3 mt-1 flex items-start gap-2.5 text-xs">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary-text">You rated this {booking.rating} ★</span>
            <p className="text-secondary-text italic mt-0.5">"{booking.review}"</p>
          </div>
        </div>
      )}

      {/* Adaptive Actions Row */}
      <div className="border-t border-border-primary dark:border-border-primary pt-4 flex flex-wrap items-center justify-end gap-2.5">
        
        {/* Customer Actions */}
        {role === 'customer' && (
          <>
            {/* Track Provider if en route */}
            {booking.status === 'on_the_way' && (
              <button
                onClick={() => setShowLiveTracking(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5" />
                Track Provider
              </button>
            )}

            {/* Cancel Booking (only if pending or accepted and step is accept-only) */}
            {(booking.status === 'pending' || (booking.status === 'accepted' && currentStep === 1)) && (
              <button
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border-primary text-secondary-text hover:bg-bg-secondary dark:border-border-primary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary transition-colors cursor-pointer"
              >
                Cancel Booking
              </button>
            )}

            {/* Leave a Review (if completed and not rated yet) */}
            {booking.status === 'completed' && !booking.rating && onReviewClick && (
              <button
                onClick={() => onReviewClick(booking)}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Write Review
              </button>
            )}

            {/* Live Track Booking */}
            {['searching', 'accepted', 'on_the_way', 'arrived', 'started'].includes(booking.status) && (
              <button
                onClick={() => navigate(`/customer/tracking/${booking.id}`)}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5" />
                Live Tracking
              </button>
            )}
            
            {/* Report Complaint (if completed or rejected or cancelled) */}
            {(booking.status === 'completed' || booking.status === 'cancelled') && onComplaintClick && (
              <button
                onClick={() => onComplaintClick(booking)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Report Problem
              </button>
            )}
          </>
        )}

        {/* Service Provider Actions */}
        {role === 'provider' && (
          <>
            {/* Accept / Reject Booking (only if pending) */}
            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer"
                >
                  Decline
                </button>
                <button
                  onClick={() => {
                    updateBookingStatus(booking.id, 'accepted');
                    localStorage.setItem(`booking_step_${booking.id}`, '1');
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 cursor-pointer"
                >
                  Accept Booking
                </button>
              </div>
            )}

            {/* Interactive Progress Advancers (if accepted and we have active sub-steps) */}
            {['accepted', 'on_the_way', 'arrived', 'started'].includes(booking.status) && (
              <div className="flex gap-2 items-center">
                <Link
                  to={`/provider/tracking/${booking.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/25 flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Open Tracking Map</span>
                </Link>
                
                {currentStep === 1 && (
                  <button
                    onClick={advanceStep}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/25 flex items-center gap-1 cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Start Travel (On Way)</span>
                  </button>
                )}

                {currentStep === 2 && booking.status === 'on_the_way' && (
                  <button
                    onClick={advanceStep}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/25 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Mark as Arrived</span>
                  </button>
                )}
                {currentStep === 2 && booking.status === 'arrived' && (
                  <button
                    onClick={advanceStep}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/25 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Service</span>
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    onClick={advanceStep}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Admin Actions */}
        {role === 'admin' && (
          <div className="flex gap-2 items-center text-xs">
            <span className="text-secondary-text italic">Admin Controls:</span>
            <button
              onClick={() => updateBookingStatus(booking.id, 'completed')}
              disabled={booking.status === 'completed'}
              className="px-2.5 py-1.5 rounded-lg border border-border-primary hover:bg-bg-secondary text-secondary-text disabled:opacity-50 cursor-pointer"
            >
              Force Complete
            </button>
            <button
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              disabled={booking.status === 'cancelled'}
              className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 text-red-600 disabled:opacity-50 cursor-pointer"
            >
              Force Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* Provider Location Tracker - Only renders for Provider when en route */}
      {role === 'provider' && booking.status === 'on_the_way' && (
        <ProviderLocationTracker 
          bookingId={booking.id} 
          isTrackingActive={true} 
          onStopTracking={() => {}} 
        />
      )}
      
      {/* Customer Live Tracking Overlay */}
      <AnimatePresence>
        {showLiveTracking && (
          <CustomerLiveTrackingMap 
            bookingId={booking.id}
            customerLocation={{ lat: 12.9716, lng: 77.5946 }} // Hardcoded customer destination for demo
            onClose={() => setShowLiveTracking(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
