import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceCard } from '../../components/ServiceCard';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../utils/translations';

export const CustomerFavorites: React.FC = () => {
  const { favorites, services, currentUser, language } = useApp();
  const { t } = useTranslation(language);

  const favoriteServices = useMemo(() => {
    return services.filter(s => favorites.includes(s.id));
  }, [services, favorites]);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="customer-favorites-page">
      <div>
        <h1 className="text-2xl font-black text-primary-text">{t('wishlist')}</h1>
        <p className="text-xs text-secondary-text mt-1 font-bold">Your curated collection of top-rated, preferred neighborhood service professionals.</p>
      </div>

      {favoriteServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-bg-card border border-border-primary dark:border-border-primary rounded-3xl p-6 shadow-sm max-w-lg mx-auto space-y-4">
          <Heart className="h-10 w-10 text-rose-500 mx-auto" />
          <h4 className="text-sm font-black text-primary-text150">{t('noFavorites')}</h4>
          <p className="text-xs text-secondary-text max-w-sm mx-auto leading-relaxed">
            {t('noFavoritesDesc')}
          </p>
          <Link
            to="/services"
            className="mt-4 inline-block px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md cursor-pointer"
          >
            {t('allCategories')}
          </Link>
        </div>
      )}
    </div>
  );
};
