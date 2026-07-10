import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { paymentApi } from '../../api/paymentApi';
import { 
  CreditCard, 
  Download, 
  Search, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { formatINR } from '../../utils/format';

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};

interface PaymentRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  invoiceId: string;
}

export const CustomerPayments: React.FC = () => {
  const { toast } = useApp() as any;
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Refunded' | 'Failed'>('All');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getHistory();
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      toast('Failed to load payment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDownloadInvoice = (paymentId: string) => {
    try {
      const downloadUrl = paymentApi.getInvoiceDownloadUrl(paymentId);
      // Create an anchor and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `invoice-${paymentId}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast('Downloading invoice...', 'success');
    } catch (err) {
      toast('Failed to download invoice', 'error');
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All' || 
      payment.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900">
            <RefreshCw className="h-3.5 w-3.5" />
            Refunded
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900">
            <XCircle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-850 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in" id="customer-payments-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" />
            Billing & Payments
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Access your transaction logs, invoice history, and manage download receipts.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-bg-card p-5 rounded-2xl border border-border-primary shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary-text uppercase tracking-wider">Total Invoices</p>
            <h3 className="text-xl font-black text-primary-text mt-1">{payments.length}</h3>
          </div>
        </div>

        <div className="bg-bg-card p-5 rounded-2xl border border-border-primary shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary-text uppercase tracking-wider">Successful Payments</p>
            <h3 className="text-xl font-black text-primary-text mt-1">
              {payments.filter(p => p.paymentStatus === 'Paid').length}
            </h3>
          </div>
        </div>

        <div className="bg-bg-card p-5 rounded-2xl border border-border-primary shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary-text uppercase tracking-wider">Awaiting Settlement</p>
            <h3 className="text-xl font-black text-primary-text mt-1">
              {payments.filter(p => p.paymentStatus === 'Pending').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-bg-card p-4 rounded-2xl border border-border-primary shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-secondary-text" />
          <input
            type="text"
            placeholder="Search by provider, txn, booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All', 'Paid', 'Pending', 'Failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'bg-bg-secondary hover:bg-bg-secondary/80 text-secondary-text border border-border-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-bg-card border border-border-primary rounded-2xl space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-xs text-secondary-text">Loading secure payment records...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-bg-card border border-border-primary rounded-2xl space-y-4 shadow-sm">
          <div className="p-4 rounded-full bg-bg-secondary text-secondary-text">
            <CreditCard className="h-10 w-10 opacity-60" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-primary-text">No Transactions Found</h3>
            <p className="text-xs text-secondary-text mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your filters or search query to find your transaction.' 
                : 'Your payment activity log is currently empty. Once you book a service, invoices will automatically sync here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-bg-card rounded-2xl border border-border-primary shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-primary bg-bg-secondary/40 text-secondary-text text-[10px] uppercase font-black tracking-wider">
                  <th className="py-4 px-6">Invoice & Booking ID</th>
                  <th className="py-4 px-6">Provider</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Method & TXN</th>
                  <th className="py-4 px-6">Payment Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/60 text-xs">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-bg-secondary/20 transition-colors">
                    {/* Invoice & Booking ID */}
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-primary-text">{payment.invoiceId}</div>
                      <div className="font-mono text-[10px] text-secondary-text mt-0.5">
                        Booking: #{payment.bookingId}
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-primary-text">{payment.providerName}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-black text-primary-text text-sm">
                      {formatINR(payment.amount)}
                    </td>

                    {/* Method & TXN */}
                    <td className="py-4 px-6">
                      <div className="text-primary-text flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-secondary-text" />
                        {payment.paymentMethod}
                      </div>
                      <div className="font-mono text-[9px] text-secondary-text mt-0.5">
                        TXN: {payment.transactionId}
                      </div>
                    </td>

                    {/* Payment Date */}
                    <td className="py-4 px-6 text-secondary-text">
                      {formatDate(payment.paymentDate)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(payment.paymentStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(payment.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/10 transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet List View */}
          <div className="lg:hidden divide-y divide-border-primary/60">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-5 space-y-4 hover:bg-bg-secondary/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                      {payment.invoiceId}
                    </span>
                    <h4 className="text-sm font-extrabold text-primary-text mt-1.5">{payment.providerName}</h4>
                    <p className="font-mono text-[10px] text-secondary-text mt-0.5">Booking: #{payment.bookingId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-primary-text">{formatINR(payment.amount)}</div>
                    <div className="mt-1">{getStatusBadge(payment.paymentStatus)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-primary/40 text-[11px] text-secondary-text">
                  <div>
                    <p className="font-bold text-secondary-text/80">Transaction ID</p>
                    <p className="font-mono text-primary-text mt-0.5">{payment.transactionId}</p>
                  </div>
                  <div>
                    <p className="font-bold text-secondary-text/80">Payment Method</p>
                    <p className="text-primary-text mt-0.5">{payment.paymentMethod}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-bold text-secondary-text/80">Settled On</p>
                    <p className="text-primary-text mt-0.5">{formatDate(payment.paymentDate)}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDownloadInvoice(payment.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download Invoice (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple RefreshCw mock icon fallback in case it's not imported or defined
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16" />
  </svg>
);
