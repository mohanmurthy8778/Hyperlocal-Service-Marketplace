import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, AlertTriangle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/format';

export const ComplaintManagement: React.FC = () => {
  const { complaints, bookings, resolveComplaint, toast } = useApp();

  const unresolvedComplaints = useMemo(() => {
    return complaints.filter(c => c.status === 'pending');
  }, [complaints]);

  const resolvedComplaints = useMemo(() => {
    return complaints.filter(c => c.status === 'resolved');
  }, [complaints]);

  const handleResolve = (id: string, decision: 'refund' | 'release' | 'dismiss') => {
    resolveComplaint(id, decision);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="complaints-arbitration">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text">Dispute Arbitration Desk</h1>
          <p className="text-xs text-secondary-text mt-1">Examine billing disputes, lateness claims, property damages, and issue settlements.</p>
        </div>

        <Link
          to="/admin"
          className="px-3.5 py-1.5 border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text rounded-xl flex items-center gap-1.5 dark:border-border-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Console Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Col Span 2): Open Disputes list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-secondary-text uppercase tracking-widest">Open Claims ({unresolvedComplaints.length})</h3>
          
          <div className="space-y-4">
            {unresolvedComplaints.length > 0 ? (
              unresolvedComplaints.map((comp) => {
                const booking = bookings.find(b => b.id === comp.bookingId);
                return (
                  <div
                    key={comp.id}
                    className="p-5 bg-bg-card border border-border-primary rounded-2xl shadow-sm space-y-4"
                    id={`complaint-card-${comp.id}`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {comp.issue}
                        </span>
                        <h4 className="text-xs font-extrabold text-primary-text mt-1.5">Claim ID: #{comp.id}</h4>
                        <span className="text-[10px] text-secondary-text block">Filed on {comp.date}</span>
                      </div>

                      <div className="text-right text-[10px] text-secondary-text">
                        <span>Booking Ref: </span>
                        <strong className="text-primary-text">#{comp.bookingId}</strong>
                        {booking && (
                          <span className="block text-xs font-bold text-primary-text pt-1">
                            Amount: {formatINR(booking.totalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description detail */}
                    <div className="p-3 bg-bg-secondary rounded-xl border border-border-primary dark:border-border-primary text-xs text-secondary-text leading-relaxed">
                      <strong>Client Statement: </strong>
                      <span>"{comp.description}"</span>
                    </div>

                    {/* Metadata on associated users */}
                    {booking && (
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-secondary-text font-semibold border-t border-dashed border-border-primary dark:border-border-primary pt-3">
                        <div>
                          <span>Filing Customer: </span>
                          <strong className="text-primary-text">{booking.customerName}</strong>
                        </div>
                        <div>
                          <span>Accused Partner: </span>
                          <strong className="text-primary-text">{booking.providerName}</strong>
                        </div>
                      </div>
                    )}

                    {/* Actions Trigger Group */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border-primary dark:border-border-primary">
                      <button
                        onClick={() => handleResolve(comp.id, 'refund')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Issue Refund to Client</span>
                      </button>

                      <button
                        onClick={() => handleResolve(comp.id, 'release')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-all"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Release Funds to Partner</span>
                      </button>

                      <button
                        onClick={() => handleResolve(comp.id, 'dismiss')}
                        className="px-3 py-1.5 bg-bg-secondary hover:bg-bg-secondary dark:bg-bg-card text-secondary-text text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Dismiss Claim</span>
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-bg-card border border-border-primary rounded-2xl p-6">
                <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3 animate-pulse" />
                <h4 className="text-sm font-extrabold text-primary-text">Dispute docket is empty</h4>
                <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1 leading-relaxed">
                  Excellent work! No unresolved booking disputes or quality escalations are pending on the marketplace.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Resolved docket log */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-secondary-text uppercase tracking-widest">Resolved Log ({resolvedComplaints.length})</h3>
          
          <div className="space-y-3.5">
            {resolvedComplaints.length > 0 ? (
              resolvedComplaints.map((comp) => (
                <div key={comp.id} className="p-4 bg-bg-card border border-border-primary rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between">
                    <strong className="text-primary-text">Claim #{comp.id}</strong>
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest">Resolved</span>
                  </div>
                  <p className="text-secondary-text italic">"{comp.description}"</p>
                  <p className="text-[10px] text-secondary-text font-semibold border-t border-border-primary dark:border-border-primary pt-2 leading-relaxed">
                    <strong>Resolution Outcome: </strong>
                    <span>{comp.resolution || 'Claim was dismissed upon vetting.'}</span>
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-secondary-text italic">No historical settlements.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
