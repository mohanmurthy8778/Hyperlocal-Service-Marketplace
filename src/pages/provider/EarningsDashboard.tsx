import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { IndianRupee, ArrowLeft, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/format';

export const EarningsDashboard: React.FC = () => {
  const { currentUser, bookings, toast } = useApp();

  const providerBookings = useMemo(() => {
    return bookings.filter(b => b.providerId === currentUser?.id && b.status === 'completed');
  }, [bookings, currentUser]);

  const totalEarnings = useMemo(() => {
    return providerBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  }, [providerBookings]);

  const averageTicket = useMemo(() => {
    if (providerBookings.length === 0) return 0;
    return Math.round(totalEarnings / providerBookings.length);
  }, [providerBookings, totalEarnings]);

  // Mock charts dataset
  const chartData = [
    { name: 'Jan', earnings: 14000 },
    { name: 'Feb', earnings: 18000 },
    { name: 'Mar', earnings: 12000 },
    { name: 'Apr', earnings: 24000 },
    { name: 'May', earnings: 31000 },
    { name: 'Jun', earnings: totalEarnings > 0 ? totalEarnings : 26000 }
  ];

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="earnings-page">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text">Earnings Analytics</h1>
          <p className="text-xs text-secondary-text mt-1">Review payouts, transaction history, and average package performance.</p>
        </div>

        <Link
          to="/provider"
          className="px-3.5 py-1.5 border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text rounded-xl flex items-center gap-1.5 dark:border-border-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Gross Revenue', value: formatINR(totalEarnings > 0 ? totalEarnings : 36200), sub: 'Lifetime payouts', icon: IndianRupee, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Average Ticket Value', value: formatINR(averageTicket > 0 ? averageTicket : 1250), sub: 'Per package booked', icon: ArrowUpRight, color: 'text-primary bg-primary/15' },
          { label: 'Next Payout Date', value: 'July 15, 2026', sub: 'Bi-weekly auto-deposit', icon: ShieldCheck, color: 'text-primary bg-primary/15' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-bg-card rounded-2xl border border-border-primary p-5 dark:border-border-primary shadow-sm flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block">{card.label}</span>
                <h3 className="text-xl font-extrabold text-primary-text">{card.value}</h3>
                <span className="text-[10px] text-secondary-text block">{card.sub}</span>
              </div>

              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Earnings Area Chart (Col Span 2) */}
        <div className="lg:col-span-2 bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-secondary-text uppercase tracking-widest block">Monthly Performance Log</h3>
            <button
              onClick={() => toast('Financial report downloaded successfully!', 'success')}
              className="px-2.5 py-1.5 border border-border-primary hover:bg-bg-secondary dark:border-border-primary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary rounded-lg text-[10px] font-bold text-secondary-text flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-primary)" />
                <XAxis dataKey="name" stroke="var(--color-muted-text)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-text)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: 'none', borderRadius: '12px', color: 'var(--color-primary-text)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger logs */}
        <div className="bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-secondary-text uppercase tracking-widest block">Payout Ledger</h3>
            
            <div className="space-y-3.5">
              {[
                { period: 'Jun 15 – Jun 30', amount: '₹34,500', status: 'Cleared', date: 'Jun 30, 2026' },
                { period: 'Jun 01 – Jun 14', amount: '₹51,000', status: 'Cleared', date: 'Jun 14, 2026' },
                { period: 'May 15 – May 31', amount: '₹31,200', status: 'Cleared', date: 'May 31, 2026' }
              ].map(( payout, i) => (
                <div key={i} className="text-xs flex justify-between items-center border-b border-border-primary dark:border-border-primary pb-3 last:border-0 last:pb-0">
                  <div>
                    <strong className="text-primary-text block">{payout.period}</strong>
                    <span className="text-[10px] text-secondary-text">Processed on {payout.date}</span>
                  </div>

                  <div className="text-right">
                    <strong className="text-primary-text block">{payout.amount}</strong>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">{payout.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-secondary-text leading-normal border-t border-border-primary dark:border-border-primary pt-4">
            * Direct Deposit transfers generally require 1-2 banking business days to post to your registered savings or checking ledger account.
          </div>
        </div>

      </div>

    </div>
  );
};
