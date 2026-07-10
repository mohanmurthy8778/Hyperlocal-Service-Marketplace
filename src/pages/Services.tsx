import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { customerApi } from '../api/customerApi';
import { ProviderCard } from '../components/ProviderCard';
import { ProviderBookingModal } from '../components/ProviderBookingModal';
import { Search, Loader2, SlidersHorizontal, MapPin } from 'lucide-react';
import { MOCK_CATEGORIES } from '../data';

export const Services: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingProvider, setBookingProvider] = useState<any | null>(null);
  
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const data = await customerApi.getServices(category);
        const mapped = data.map((s: any) => ({
          ...s,
          id: s.package_id || s.id,
          fullName: s.providerName || s.provider_name || 'Service Provider',
          serviceCategory: s.category || s.categoryId || 'cleaning',
          price: Number(s.price) || 0,
          rating: Number(s.rating || s.providerRating) || 5.0,
          availability: s.availability || 'ONLINE',
          verified: s.verified !== undefined ? s.verified : true,
          experience: s.duration || '1-2 Hours',
          description: s.description || '',
          serviceImage: s.images?.[0] || s.image_url || s.image || '',
          profileImage: s.providerAvatar || '',
        }));
        setProviders(mapped);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [category]);

  const handleCategoryChange = (c: string) => {
    setCategory(c);
    setSearchParams({ category: c });
  };

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (ratingFilter > 0 && p.rating < ratingFilter) return false;
      if (availabilityFilter !== 'all' && p.availability !== availabilityFilter.toUpperCase()) return false;
      return true;
    });
  }, [providers, ratingFilter, availabilityFilter]);

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-card pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-text mb-4">Find Professionals</h1>
            {/* Categories */}
            <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  category === 'all' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-secondary-text hover:bg-gray-50 dark:hover:bg-gray-700 border border-border-primary'
                }`}
              >
                All Categories
              </button>
              {MOCK_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all flex items-center gap-2 ${
                    category === cat.id 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white dark:bg-gray-800 text-secondary-text hover:bg-gray-50 dark:hover:bg-gray-700 border border-border-primary'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl border border-border-primary">
            <SlidersHorizontal className="w-5 h-5 text-secondary-text ml-2" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="bg-transparent text-sm text-primary-text outline-none pr-2"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
            <div className="w-px h-6 bg-border-primary mx-1"></div>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-transparent text-sm text-primary-text outline-none pr-2"
            >
              <option value="all">Any Availability</option>
              <option value="online">Online Now</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary-text">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Loading professionals...</p>
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProviders.map(provider => (
              <ProviderCard 
                key={provider.id} 
                provider={provider} 
                onBook={() => setBookingProvider(provider)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border border-border-primary shadow-sm">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-secondary-text" />
            </div>
            <h3 className="text-xl font-bold text-primary-text mb-2">0 Providers Found</h3>
            <p className="text-secondary-text max-w-md">
              No providers are available for this category or filter. Try adjusting your search criteria.
            </p>
          </div>
        )}

      </div>

      {/* Booking Modal */}
      {bookingProvider && (
        <ProviderBookingModal 
          provider={bookingProvider} 
          onClose={() => setBookingProvider(null)} 
        />
      )}
    </div>
  );
};
