import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingCard } from '../../components/BookingCard';
import { Modal } from '../../components/Modal';
import { Booking } from '../../types';
import { Star, MessageSquare, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export const CustomerBookings: React.FC = () => {
  const { currentUser, bookings, addReview, addComplaint, toast } = useApp();

  // Tab Filtering state
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  // Modal states
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [selectedBookingForComplaint, setSelectedBookingForComplaint] = useState<Booking | null>(null);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Complaint Form States
  const [complaintIssue, setComplaintIssue] = useState('Service not as described');
  const [complaintDesc, setComplaintDesc] = useState('');

  const customerBookings = useMemo(() => {
    return bookings.filter(b => b.customerId === currentUser?.id);
  }, [bookings, currentUser]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return customerBookings;
    if (activeTab === 'pending') {
      return customerBookings.filter(b => b.status === 'pending' || b.status === 'searching');
    }
    if (activeTab === 'accepted') {
      return customerBookings.filter(b => ['accepted', 'on_the_way', 'arrived', 'started'].includes(b.status));
    }
    return customerBookings.filter(b => b.status === activeTab);
  }, [customerBookings, activeTab]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    addReview(selectedBookingForReview.serviceId, reviewRating, reviewComment);
    setSelectedBookingForReview(null);
    setReviewComment('');
    setReviewRating(5);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForComplaint) return;

    addComplaint(selectedBookingForComplaint.id, complaintIssue, complaintDesc);
    setSelectedBookingForComplaint(null);
    setComplaintDesc('');
    setComplaintIssue('Service not as described');
  };

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="customer-bookings-page">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary-text">My Booking History</h1>
        <p className="text-xs text-secondary-text mt-1">Review status, manage bookings, rate providers, or contact support.</p>
      </div>

      {/* Booking Tabs Selector */}
      <div className="flex border-b border-border-primary overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'all' 
            ? customerBookings.length 
            : customerBookings.filter(b => b.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold whitespace-nowrap px-3 transition-all border-b-2 -mb-0.5 flex items-center gap-1.5 ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary-text hover:text-secondary-text dark:hover:text-secondary-text'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`h-4.5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-primary/15 text-primary' : 'bg-bg-secondary text-secondary-text dark:bg-bg-card'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main listings content */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role="customer"
              onReviewClick={(b) => setSelectedBookingForReview(b)}
              onComplaintClick={(b) => setSelectedBookingForComplaint(b)}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-bg-card border border-border-primary rounded-3xl p-6">
            <CheckCircle className="h-10 w-10 text-secondary-text mx-auto mb-3" />
            <h4 className="text-sm font-extrabold text-primary-text">No Bookings In This Tab</h4>
            <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1">
              There are currently no bookings matching the "{activeTab}" filter.
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: Write Review */}
      <Modal
        isOpen={selectedBookingForReview !== null}
        onClose={() => setSelectedBookingForReview(null)}
        title="Submit Quality Review"
      >
        {selectedBookingForReview && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Service Rated</span>
              <h4 className="text-xs font-bold text-primary-text">{selectedBookingForReview.serviceTitle}</h4>
              <p className="text-[10px] text-primary font-semibold mt-0.5">by {selectedBookingForReview.providerName}</p>
            </div>

            {/* Stars selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Choose Star Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = star <= reviewRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${isGold ? 'fill-amber-400 text-amber-400' : 'text-secondary-text dark:text-secondary-text'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Your Feedback Comment</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience working with this provider! Was the service detailed, punctual, and polite?"
                className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal shadow-md"
            >
              Submit Star Review
            </button>
          </form>
        )}
      </Modal>

      {/* MODAL 2: Report Support Complaint */}
      <Modal
        isOpen={selectedBookingForComplaint !== null}
        onClose={() => setSelectedBookingForComplaint(null)}
        title="File Support Complaint"
      >
        {selectedBookingForComplaint && (
          <form onSubmit={handleComplaintSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Job Reference</span>
              <h4 className="text-xs font-bold text-primary-text">{selectedBookingForComplaint.serviceTitle}</h4>
              <p className="text-[10px] text-secondary-text mt-0.5">Booking ID: #{selectedBookingForComplaint.id}</p>
            </div>

            {/* Issue select dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Reason / Issue Category</label>
              <select
                value={complaintIssue}
                onChange={(e) => setComplaintIssue(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none"
              >
                <option value="Service not as described">Service not as described / poor execution</option>
                <option value="Provider arrived late or missed appointment">Provider arrived late / missed appointment</option>
                <option value="Payment / billing discrepancies">Payment / billing discrepancy</option>
                <option value="Property damage or safety dispute">Property damage or safety dispute</option>
              </select>
            </div>

            {/* Description comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary-text">Detailed Dispute Explanation</label>
              <textarea
                required
                rows={3}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                placeholder="Explain the issue clearly. Our operations team will examine timesheets and call logs to coordinate a settlement or refund."
                className="w-full text-xs p-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md"
            >
              Submit Dispute Complaint
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
};
