import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Loader2, User, Phone, Briefcase } from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const ProviderBookingModal = ({ provider, onClose }: { provider: any, onClose: () => void }) => {
  const { currentUser, toast, refreshAllData } = useApp();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast('Please login to book a service', 'error');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await customerApi.createBooking({
        providerId: provider.providerId || provider.id,
        providerName: provider.providerName || provider.fullName,
        serviceId: provider.package_id || provider.id,
        serviceTitle: provider.serviceTitle || provider.title || provider.name || provider.fullName,
        customerId: currentUser.id,
        customerName: customerName || currentUser.name,
        customerPhone: customerPhone,
        category: provider.serviceCategory,
        totalPrice: provider.price,
        bookingDate: date,
        bookingTime: time,
        address,
        notes,
        latitude: currentUser.latitude || 12.9716,
        longitude: currentUser.longitude || 77.5946
      });
      toast('Booking request sent successfully!', 'success');
      try {
        await refreshAllData();
      } catch (refreshErr) {
        console.warn('Failed to refresh data after booking', refreshErr);
      }
      onClose();
      navigate('/customer/bookings');
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to create booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-border-primary">
          <div>
            <h2 className="text-xl font-bold text-primary-text">Book Service</h2>
            <p className="text-xs text-secondary-text">Selected Provider: <span className="font-semibold text-primary">{provider.fullName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-secondary-text hover:bg-bg-secondary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Read-Only Service and Provider Badges */}
          <div className="grid grid-cols-2 gap-3 bg-bg-secondary/50 p-3 rounded-xl border border-border-primary">
            <div>
              <span className="text-[10px] uppercase font-bold text-secondary-text block">Category</span>
              <span className="text-xs font-bold text-primary-text flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                {provider.serviceCategory}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-secondary-text block">Selected Provider</span>
              <span className="text-xs font-bold text-primary-text mt-0.5 block">{provider.fullName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary-text mb-1.5">Customer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary-text" />
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Your Name" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary-text mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary-text" />
                <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Your Phone" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary-text mb-1.5">Service Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary-text" />
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary-text mb-1.5">Preferred Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary-text" />
                <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary-text mb-1.5">Service Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-secondary-text" />
              <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="Enter complete address..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary-text mb-1.5">Additional Notes (Optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="Any special requirements..." />
          </div>

          <div className="pt-4 border-t border-border-primary flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-secondary-text font-medium">Estimated Total</span>
              <span className="text-lg font-black text-primary-text">₹{provider.price}</span>
            </div>
            <button disabled={loading} type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/10 transition-all flex items-center gap-2 text-sm cursor-pointer">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
