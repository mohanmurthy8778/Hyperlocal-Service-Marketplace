import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center space-y-6 transition-colors duration-200" id="not-found-page">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
        <MapPin className="h-8 w-8 animate-bounce" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-primary-text">Page Not Found</h1>
      <p className="text-xs text-secondary-text max-w-sm mx-auto leading-relaxed">
        We couldn't locate the page you were looking for. The route might have changed, or you might be lost in our hyperlocal grid!
      </p>

      <Link
        to="/"
        className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-charcoal bg-primary hover:bg-primary-dark shadow-md transition-all"
      >
        Go back to Home
      </Link>
    </div>
  );
};
