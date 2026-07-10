import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { BookingCard } from '../../components/BookingCard';
import { 
  Calendar, Heart, Sparkles, User, Settings, 
  MapPin, ShoppingBag, ChevronRight, Compass,
  TrendingUp, BarChart3, PieChart as PieIcon, Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../../utils/format';
import { useTranslation } from '../../utils/translations';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

const PricePredictorWidget: React.FC = () => {
  const [category, setCategory] = useState("Cleaning Services");
  const [rating, setRating] = useState(4.5);
  const [demand, setDemand] = useState(1.2);
  const [distance, setDistance] = useState(5.0);
  const [isWeekend, setIsWeekend] = useState(false);

  const prediction = useMemo(() => {
    const baseRates: Record<string, number> = {
      "Cleaning Services": 450.0,
      "Plumbing": 550.0,
      "Electrical": 600.0,
      "Home Appliances": 800.0,
      "Beauty & Salon": 700.0,
      "Gardening": 400.0,
      "Pest Control": 900.0
    };
    
    const base = baseRates[category] || 500.0;
    let predicted = base * demand * (rating / 4.5) * (1.0 + 0.015 * distance);
    if (isWeekend) {
      predicted *= 1.12;
    }
    
    const discount = demand < 1.1 ? 12.0 : (demand < 1.35 ? 5.0 : 0.0);
    const confidence = 0.85 + (rating / 5.0) * 0.12;

    return {
      predictedPrice: Math.round(predicted),
      suggestedDiscount: discount,
      confidenceScore: Math.round(confidence * 100)
    };
  }, [category, rating, demand, distance, isWeekend]);

  return (
    <div className="space-y-3.5 text-xs text-secondary-text">
      <div className="space-y-1">
        <label className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wide block">Service Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-bg-secondary dark:bg-bg-card border border-border-primary rounded-xl px-3 py-2 text-xs text-primary-text focus:outline-none focus:border-primary"
        >
          {["Cleaning Services", "Plumbing", "Electrical", "Home Appliances", "Beauty & Salon", "Gardening", "Pest Control"].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-extrabold text-secondary-text uppercase tracking-wide">
            <span>Rating</span>
            <span className="text-primary font-black">{rating} ★</span>
          </div>
          <input
            type="range"
            min="3.5"
            max="5.0"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-full accent-primary bg-bg-secondary dark:bg-bg-card border-border-primary h-1 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-extrabold text-secondary-text uppercase tracking-wide">
            <span>Demand</span>
            <span className="text-primary font-black">{demand}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={demand}
            onChange={(e) => setDemand(parseFloat(e.target.value))}
            className="w-full accent-primary bg-bg-secondary dark:bg-bg-card border-border-primary h-1 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-extrabold text-secondary-text uppercase tracking-wide">
            <span>Distance</span>
            <span className="text-primary font-black">{distance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            className="w-full accent-primary bg-bg-secondary dark:bg-bg-card border-border-primary h-1 rounded-lg cursor-pointer"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-3 select-none">
          <input
            type="checkbox"
            checked={isWeekend}
            onChange={(e) => setIsWeekend(e.target.checked)}
            className="rounded border-border-primary bg-bg-secondary dark:bg-bg-card text-primary focus:ring-0"
          />
          <span className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wide">Weekend Surge</span>
        </label>
      </div>

      <div className="bg-bg-secondary dark:bg-bg-card p-3 rounded-xl border border-border-primary grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[8px] font-extrabold text-secondary-text uppercase tracking-wide block">Predicted Cost</span>
          <span className="text-sm font-black text-primary block mt-0.5">{formatINR(prediction.predictedPrice)}</span>
        </div>
        <div>
          <span className="text-[8px] font-extrabold text-secondary-text uppercase tracking-wide block">Promo Off</span>
          <span className="text-xs font-bold text-emerald-400 block mt-1">{prediction.suggestedDiscount}%</span>
        </div>
        <div>
          <span className="text-[8px] font-extrabold text-secondary-text uppercase tracking-wide block">Confidence</span>
          <span className="text-xs font-bold text-secondary-text block mt-1">{prediction.confidenceScore}%</span>
        </div>
      </div>
    </div>
  );
};

export const CustomerDashboard: React.FC = () => {
  const { currentUser, bookings, favorites, services, language } = useApp();
  const { t } = useTranslation(language);

  const customerBookings = useMemo(() => {
    return bookings.filter(b => b.customerId === currentUser?.id);
  }, [bookings, currentUser]);

  const activeCount = useMemo(() => {
    return customerBookings.filter(b => b.status === 'pending' || b.status === 'accepted').length;
  }, [customerBookings]);

  const totalSpent = useMemo(() => {
    return customerBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }, [customerBookings]);

  // Spending per category for Pie Chart
  const spendingByCategoryData = useMemo(() => {
    const dataMap: { [key: string]: number } = {};
    customerBookings
      .filter(b => b.status === 'completed')
      .forEach(b => {
        dataMap[b.categoryName] = (dataMap[b.categoryName] || 0) + b.totalPrice;
      });
    
    // Fallback if no spending yet
    if (Object.keys(dataMap).length === 0) {
      return [
        { name: 'Home Cleaning', value: 2500 },
        { name: 'Home Repairs', value: 1800 },
        { name: 'Salon & Spa', value: 1200 }
      ];
    }

    return Object.keys(dataMap).map(name => ({
      name,
      value: dataMap[name]
    }));
  }, [customerBookings]);

  // Spending over months for Bar/Line Chart
  const monthlySpendingData = useMemo(() => {
    // Create deterministic trends
    return [
      { name: 'Jan', amount: 1500 },
      { name: 'Feb', amount: 3200 },
      { name: 'Mar', amount: 2400 },
      { name: 'Apr', amount: 4800 },
      { name: 'May', amount: totalSpent > 0 ? totalSpent : 3500 },
    ];
  }, [totalSpent]);

  const recentBookings = customerBookings.slice(0, 3);

  const COLORS = ['#D4AF37', '#9CA3AF', '#4B5563', '#1F1F1F', '#F5F5F5'];

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200" id="customer-dashboard">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-bg-secondary dark:from-bg-card to-bg-secondary dark:to-bg-card border border-border-primary rounded-3xl p-6 sm:p-8 text-primary-text shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-primary shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-1.5 text-primary-text">
              <span>Welcome Back, {currentUser.name}!</span>
              <Sparkles className="h-5 w-5 text-primary" />
            </h1>
            <p className="text-xs text-secondary-text mt-1">
              {t('analyticsOverview')} for your hyperlocal account based in {currentUser.address.split(',')[1] || 'Seattle'}.
            </p>
          </div>
        </div>

        <div className="flex gap-2 relative z-10 w-full sm:w-auto">
          <Link
            to="/customer/settings"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-bg-secondary dark:bg-bg-card border-border-primary hover:bg-bg-secondary text-xs font-bold rounded-xl border border-border-primary text-secondary-text transition-all cursor-pointer"
          >
            {t('settings')}
          </Link>
          <Link
            to="/services"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-xs font-bold rounded-xl text-white shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            {t('bookNow')}
          </Link>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('upcomingBookings'), value: activeCount, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400' },
          { label: t('completedJobs'), value: customerBookings.filter(b => b.status === 'completed').length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' },
          { label: t('totalSpending'), value: formatINR(totalSpent), color: 'text-primary bg-primary/10' },
          { label: t('wishlist'), value: favorites.length, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20 dark:text-pink-400' }
        ].map((card, idx) => (
          <div key={idx} className="bg-bg-card border border-border-primary p-5 rounded-2xl dark:border-border-primary shadow-xs space-y-2">
            <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block">{card.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-primary-text">{card.value}</span>
              <span className={`h-6 w-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center ${card.color}`}>
                ★
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Over Time Bar Chart */}
        <div className="lg:col-span-2 bg-bg-card border border-border-primary rounded-3xl p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-border-primary dark:border-border-primary pb-3">
            <h3 className="text-sm font-black text-primary-text flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>{t('monthlyBookings')} & Spending Trend</span>
            </h3>
            <span className="text-[10px] text-secondary-text font-extrabold uppercase tracking-wide">Last 5 Months</span>
          </div>
          
          <div className="h-64 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendingData}>
                <XAxis dataKey="name" stroke="var(--color-muted-text)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-muted-text)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }} 
                  contentStyle={{ backgroundColor: '#1F1F1F', color: '#FFF', borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="amount" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-bg-card border border-border-primary rounded-3xl p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-border-primary dark:border-border-primary pb-3">
            <h3 className="text-sm font-black text-primary-text flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>{t('ratingBreakdown')} by Category</span>
            </h3>
            <span className="text-[10px] text-secondary-text font-extrabold uppercase tracking-wide">Share (%)</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {spendingByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', color: '#FFF', borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-secondary-text pt-1">
            {spendingByCategoryData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Intelligence Panel */}
      <div className="bg-gradient-to-br from-bg-secondary dark:from-bg-card to-bg-secondary dark:to-bg-card border border-border-primary rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border-primary pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <h2 className="text-base font-black text-primary-text">AI Hyperlocal Intelligence</h2>
              <p className="text-[10px] text-secondary-text">Live predictions, recommendations, and analytics matching your consumer profile</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-primary/20">Model V2.4 Active</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Customer Profile Segment */}
          <div className="bg-bg-secondary/50 dark:bg-bg-card/50 border border-border-primary rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>Behavioral Profile</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-bg-secondary dark:bg-bg-card p-4 rounded-xl border border-border-primary">
                <span className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wide block">Clustering Segment</span>
                <span className="text-sm font-black text-primary-text block mt-0.5">Premium Connoisseur</span>
                <p className="text-[10px] text-secondary-text mt-1">High-budget customer preferring top-rated providers with low SLA response times.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-secondary dark:bg-bg-card p-3 rounded-xl border border-border-primary">
                  <span className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wide block">Preferred Slot</span>
                  <span className="text-xs font-bold text-secondary-text block mt-0.5">Afternoon (2-5 PM)</span>
                </div>
                <div className="bg-bg-secondary dark:bg-bg-card p-3 rounded-xl border border-border-primary">
                  <span className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wide block">Budget Tier</span>
                  <span className="text-xs font-bold text-secondary-text block mt-0.5">Tier 1 (&gt; ₹8,000)</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-secondary-text uppercase tracking-wide block mb-1">Recommendation Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Local Elite", "Priority SLA", "Eco-friendly", "Night Owl"].map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-bg-card text-secondary-text text-[10px] font-semibold rounded-md border border-border-primary">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AI Recommended Services */}
          <div className="bg-bg-secondary/50 dark:bg-bg-card/50 border border-border-primary rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4" />
              <span>Recommended For You</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: "Elite Sofa Deep Cleaning", provider: "Rajesh Cleaners", rating: 4.9, dist: 1.2, score: 98.4 },
                { name: "Kitchen Chimney Servicing", provider: "Ananya Appliances", rating: 4.8, dist: 2.1, score: 93.7 },
                { name: "SLA Emergency Plumbing Repair", provider: "Ravi Kumar", rating: 4.6, dist: 0.8, score: 91.2 }
              ].map((item, idx) => (
                <div key={idx} className="bg-bg-secondary dark:bg-bg-card p-3 rounded-xl border border-border-primary flex items-center justify-between gap-2 hover:border-primary/30 transition-all">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-bold text-primary-text block truncate">{item.name}</span>
                    <span className="text-[10px] text-secondary-text block truncate">by {item.provider} • {item.dist} km • {item.rating} ★</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-black text-primary block">{item.score}%</span>
                    <span className="text-[8px] text-secondary-text uppercase font-extrabold tracking-wide block">Match Score</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/services"
              className="w-full py-2 bg-bg-card hover:bg-bg-secondary dark:bg-bg-card border-border-primary text-center block text-[10px] text-secondary-text font-extrabold rounded-xl transition-all"
            >
              Explore All AI Picks
            </Link>
          </div>

          {/* Section 3: Interactive Dynamic Price Predictor */}
          <div className="bg-bg-secondary/50 dark:bg-bg-card/50 border border-border-primary rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Dynamic Price Predictor</span>
            </h3>

            <PricePredictorWidget />
          </div>
        </div>
      </div>

      {/* Grid: Bookings + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Bookings lists (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-primary-text flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Recent Activity & Bookings</span>
            </h2>
            <Link
              to="/customer/bookings"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>See All Bookings</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} role="customer" />
              ))
            ) : (
              <div className="text-center py-12 bg-bg-card border border-border-primary rounded-3xl p-6">
                <ShoppingBag className="h-10 w-10 text-secondary-text mx-auto mb-3" />
                <h4 className="text-sm font-extrabold text-primary-text">No Scheduled Bookings</h4>
                <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1 leading-relaxed">
                  You haven't scheduled any cleaning, repair, or massage appointments yet. Start exploring local services now!
                </p>
                <Link
                  to="/services"
                  className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold text-charcoal bg-primary hover:bg-primary-dark shadow-md shadow-primary/10"
                >
                  Explore Services
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          
          {/* Quick Info card */}
          <div className="bg-bg-card border border-border-primary rounded-3xl p-6 dark:border-border-primary shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-secondary-text uppercase tracking-widest block">Customer Profile Summary</h3>
            
            <div className="space-y-3.5 text-xs text-secondary-text">
              <div className="flex items-center gap-2.5">
                <User className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="font-bold">{currentUser.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="font-bold line-clamp-1">{currentUser.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Heart className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span className="font-bold">{favorites.length} saved service favorites</span>
              </div>
            </div>
            
            <Link
              to="/customer/settings"
              className="w-full py-2.5 rounded-xl border border-border-primary hover:bg-bg-secondary text-xs font-extrabold text-secondary-text dark:border-border-primary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary text-center block transition-all"
            >
              Update Preferences
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
