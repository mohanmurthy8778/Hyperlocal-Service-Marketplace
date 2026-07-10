import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "How do you verify your service providers?",
      a: "Every service professional on ServiceHub undergoes a strict background check, licensing verification (for electrical and plumbing), and in-person skills assessment before their profile goes live."
    },
    {
      q: "Is my booking covered by insurance?",
      a: "Yes! All scheduled jobs booked through the ServiceHub platform are covered under our standard corporate property-damage and liability insurance up to ₹10,00,000 at no extra cost to you."
    },
    {
      q: "Can I cancel or reschedule my booking?",
      a: "Absolutely. You can cancel or reschedule any pending or accepted booking directly from your Customer Dashboard up to 2 hours before the scheduled timeframe with zero cancellation penalties."
    },
    {
      q: "How does the payment structure work?",
      a: "Payments are processed securely via our digital platform. When you book a service, a hold is placed on your card. The funds are only transferred to the service provider after you mark the service as fully completed."
    },
    {
      q: "What should I do if a provider fails to arrive?",
      a: "If a provider is late or fails to arrive, please report it via the 'Report Problem' or contact our helpline immediately. We will cancel the booking with an instant refund and schedule a replacement provider for you."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 transition-colors duration-200 animate-fade-in" id="faq-page">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Knowledge Base</span>
        <h1 className="text-3xl font-extrabold text-primary-text">Frequently Asked Questions</h1>
        <p className="text-sm text-secondary-text leading-relaxed">
          Quickly resolve common inquiries about payments, provider certifications, scheduling, and service disputes.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = activeIndex === i;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border-primary bg-bg-card overflow-hidden dark:border-border-primary dark:bg-bg-card transition-all shadow-sm"
            >
              <button
                onClick={() => toggleIndex(i)}
                className="flex w-full items-center justify-between p-5 text-left text-xs font-bold text-primary-text hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary/50"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>{faq.q}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-secondary-text" /> : <ChevronDown className="h-4 w-4 text-secondary-text" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-secondary-text leading-relaxed border-t border-border-primary dark:border-border-primary">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
