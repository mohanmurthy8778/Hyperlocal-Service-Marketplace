import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import { 
  Star, Clock, MapPin, CheckCircle, ShieldCheck, 
  Calendar, CreditCard, ChevronRight, Heart, Users, MessageSquare 
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../utils/format';

export const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services, reviews, currentUser, addBooking, favorites, toggleFavorite, toast } = useApp();
  const { socket } = useSocket();

  // Find target service
  const service = useMemo(() => {
    return services.find(s => s.id === id);
  }, [services, id]);

  // Find reviews of this service
  const serviceReviews = useMemo(() => {
    return reviews.filter(r => r.serviceId === id);
  }, [reviews, id]);

  const isFav = service ? favorites.includes(service.id) : false;

  // Booking Form States
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingAddress, setBookingAddress] = useState(currentUser?.address || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [latestBookingId, setLatestBookingId] = useState('');

  // Auto-populate address if user logs in/changes
  React.useEffect(() => {
    if (currentUser?.address) {
      setBookingAddress(currentUser.address);
    }
  }, [currentUser]);

  if (!service) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-primary-text">Service Not Found</h2>
        <p className="text-xs text-secondary-text mt-2">The listing you are looking for may have been removed or updated.</p>
        <Link to="/services" className="mt-5 inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-charcoal bg-primary hover:bg-primary-dark">
          Back to Listings
        </Link>
      </div>
    );
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast("Please log in to schedule a service", "error");
      navigate('/login');
      return;
    }

    if (!bookingDate) {
      toast("Please pick a service date", "error");
      return;
    }

    if (!bookingAddress.trim()) {
      toast("Please specify a service delivery address", "error");
      return;
    }

    if (socket) {

      // Try to get geolocation if available
      let location = { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore center
      
      const sendPayload = (loc) => {
        const payload = {
          customerId: currentUser.id,
          customerName: currentUser.name,
          serviceId: service.id,
          serviceTitle: service.title,
          categoryName: service.categoryName,
          address: bookingAddress,
          location: loc,
          totalPrice: service.price,
          date: bookingDate,
          time: bookingTime,
          notes: bookingNotes
        };
        socket.emit('request_booking', payload);
        toast('Searching for a provider...', 'info');
        socket.once('booking_status_updated', (b: any) => {
          if (b.status === 'searching') {
             // Add booking to local context temporarily if needed, or rely on fetching
             navigate('/customer/tracking/' + b.id);
          }
        });
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => sendPayload({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => sendPayload(location)
        );
      } else {
        sendPayload(location);
      }
      return; // Stop the rest of the original code in this block from running

    } else {
      toast("Connection to server lost. Cannot book right now.", "error");
    }
  };

  const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200" id="service-details-page">
      
      {/* Breadcrumb line */}
      <div className="flex items-center gap-1.5 text-xs text-secondary-text font-semibold">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/services" className="hover:text-primary">Services</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-secondary-text truncate">{service.title}</span>
      </div>

      {/* Main Grid: Info + Booking Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Col Span 2): Photos, Description, Features, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Block */}
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest">
              {service.categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-text leading-tight">
              {service.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-secondary-text">
              <div className="flex items-center gap-1">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                <span className="text-primary-text font-bold">{service.rating}</span>
                <span>({service.reviewCount} customer reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-secondary-text" />
                <span>{service.duration} duration</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-secondary-text" />
                <span>{service.location}</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Responds in ~15 mins</span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Frame */}
          <div className="rounded-2xl overflow-hidden aspect-video bg-bg-secondary border border-border-primary relative shadow-sm">
            <img
              src={service.images[0]}
              alt={service.title}
              className="h-full w-full object-cover"
            />
            
            {/* Quick Fav toggle button inside Details */}
            <button
              onClick={() => toggleFavorite(service.id)}
              className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg-card/90 shadow-md backdrop-blur-sm transition-all hover:scale-105 ${isFav ? 'text-red-500' : 'text-secondary-text hover:text-red-500'}`}
            >
              <Heart className="h-5 w-5" fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Description Block */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-primary-text">Service Description</h2>
            <p className="text-xs text-secondary-text leading-relaxed text-justify">
              {service.description}
            </p>
          </div>

          {/* Key Features checklists */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-text">What's Included in this package?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {service.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-secondary-text">
                  <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vetted Service Professional Profile */}
          <div className="rounded-2xl border border-border-primary bg-bg-secondary/50 p-5 dark:border-border-primary dark:bg-bg-card/40 space-y-4">
            <h3 className="text-xs font-bold text-secondary-text uppercase tracking-widest block">Service Provider</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={service.providerAvatar}
                  alt={service.providerName}
                  className="h-14 w-14 rounded-full object-cover border border-white shadow-md"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-primary-text flex items-center gap-1.5">
                    <span>{service.providerName}</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                      Verified
                    </span>
                  </h4>
                  <p className="text-[10px] text-secondary-text mt-0.5">Professional Home Specialist since 2024</p>
                  
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-secondary-text">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <strong>{service.providerRating} Rating</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-secondary-text" />
                      <span>Elite Tier</span>
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/contact"
                className="px-4 py-2 rounded-xl border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text dark:border-border-primary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary transition-colors"
              >
                Inquire Details
              </Link>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-primary dark:border-border-primary pb-3">
              <h2 className="text-lg font-bold text-primary-text flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-secondary-text" />
                <span>Customer Reviews ({serviceReviews.length})</span>
              </h2>
            </div>

            {serviceReviews.length > 0 ? (
              <div className="space-y-4">
                {serviceReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-border-primary dark:border-border-primary/60 pb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.customerAvatar}
                        alt={rev.customerName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-primary-text">{rev.customerName}</span>
                        <span className="text-[10px] text-secondary-text block">{rev.date}</span>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-secondary-text dark:text-primary-text'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-secondary-text italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-secondary-text italic">
                No reviews yet for this service. Be the first to try it and leave your feedback!
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Transactional Booking box (Sticky) */}
        <div>
          <div className="bg-bg-card rounded-2xl border border-border-primary p-6 shadow-xl space-y-6 lg:sticky lg:top-24">
            
            {/* Price block */}
            <div className="flex justify-between items-end border-b border-border-primary dark:border-border-primary pb-4">
              <div>
                <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Standard Package Rate</span>
                <span className="text-3xl font-extrabold text-primary">{formatINR(service.price)}</span>
              </div>
              <div className="text-right text-xs font-semibold text-secondary-text">
                <span className="block text-secondary-text">{service.duration}</span>
                <span>Includes diagnostics</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-text flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Choose Service Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                />
              </div>

              {/* Time Slots selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-text flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Choose Time Window</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = bookingTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-primary text-charcoal border-primary shadow-md shadow-primary/10'
                            : 'bg-bg-card border-border-primary text-secondary-text hover:border-border-primary dark:bg-bg-card dark:border-border-primary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-text flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Delivery Address</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  placeholder="Street, unit number, city, and zip code"
                  className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Special instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-text">
                  Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any gate codes, parking instructions, or specific job notes..."
                  className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Secure Booking Guarantee */}
              <div className="flex gap-2 items-center bg-primary/5 p-3 rounded-xl border border-primary/10 text-[10px] text-secondary-text">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Standard Liability Insurance & Refund Guarantee included.</span>
              </div>

              {/* Book Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold text-primary-text transition-all shadow-lg shadow-accent/20"
              >
                Schedule & Confirm Booking
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Success Modal Dialogue */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSuccessModalOpen(false)} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg-card p-6 rounded-2xl max-w-sm w-full text-center relative z-10 border border-border-primary shadow-2xl"
          >
            <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            
            <h3 className="text-base font-extrabold text-primary-text">Booking Placed!</h3>
            <p className="text-xs text-secondary-text mt-2 leading-relaxed">
              Your service scheduled for <strong className="text-secondary-text">{bookingDate}</strong> at {bookingTime} was placed. Booking ID is <strong>#{latestBookingId}</strong>.
            </p>

            <div className="grid grid-cols-1 gap-2 mt-6">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/customer/bookings');
                }}
                className="py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal shadow-md"
              >
                View My Bookings
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/customer');
                }}
                className="py-2.5 rounded-xl border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text dark:border-border-primary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
