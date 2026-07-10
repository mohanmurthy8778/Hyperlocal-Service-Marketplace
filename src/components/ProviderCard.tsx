import React, { useState, useEffect } from 'react';
import { MapPin, Star, Briefcase, CheckCircle, Navigation } from 'lucide-react';
import { formatINR } from '../utils/format';

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'home cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
  'plumber': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80',
  'repairs': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80',
  'carpenter': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80',
  'ac repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
  'ac technician': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
  'painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
  'painting & decor': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
  'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  'salon & spa': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  'tutoring': 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
  'gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
  'lawn & garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
  'appliance repair': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
  'pest control': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&auto=format&fit=crop&q=80',
  'home renovation': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  'cctv installation': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
  'computer repair': 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&auto=format&fit=crop&q=80',
  'mobile repair': 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?w=800&auto=format&fit=crop&q=80',
  'laundry service': 'https://images.unsplash.com/photo-1545173168-9f1947e8017e?w=800&auto=format&fit=crop&q=80',
  'car wash': 'https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?w=800&auto=format&fit=crop&q=80',
  'mechanic': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
};

export const getServiceWorkImage = (category: string, fullName: string = '', description: string = ''): string => {
  const normCat = (category || '').toLowerCase().trim();
  const normName = (fullName || '').toLowerCase().trim();
  const normDesc = (description || '').toLowerCase().trim();

  if (CATEGORY_IMAGE_MAP[normCat]) {
    return CATEGORY_IMAGE_MAP[normCat];
  }

  const findMatch = (text: string) => {
    if (text.includes('clean') || text.includes('mopping')) return CATEGORY_IMAGE_MAP['cleaning'];
    if (text.includes('electrician') || text.includes('wiring') || text.includes('switchboard') || text.includes('electrical')) return CATEGORY_IMAGE_MAP['electrician'];
    if (text.includes('plumber') || text.includes('pipe') || text.includes('faucet') || text.includes('leak') || text.includes('plumbing')) return CATEGORY_IMAGE_MAP['plumber'];
    if (text.includes('carpenter') || text.includes('wood') || text.includes('furniture') || text.includes('cabinet')) return CATEGORY_IMAGE_MAP['carpenter'];
    if (text.includes('ac repair') || text.includes('ac tech') || text.includes('air conditioner') || text.includes('air conditioning')) return CATEGORY_IMAGE_MAP['ac repair'];
    if (text.includes('paint') || text.includes('decor')) return CATEGORY_IMAGE_MAP['painting'];
    if (text.includes('salon') || text.includes('spa') || text.includes('beautician') || text.includes('haircut') || text.includes('makeup')) return CATEGORY_IMAGE_MAP['salon'];
    if (text.includes('tutor') || text.includes('teacher') || text.includes('teach')) return CATEGORY_IMAGE_MAP['tutoring'];
    if (text.includes('garden') || text.includes('lawn') || text.includes('trimming') || text.includes('mowing') || text.includes('plant')) return CATEGORY_IMAGE_MAP['gardening'];
    if (text.includes('appliance') || text.includes('refrigerator') || text.includes('washing machine') || text.includes('microwave')) return CATEGORY_IMAGE_MAP['appliance repair'];
    if (text.includes('pest control') || text.includes('spray') || text.includes('bugs')) return CATEGORY_IMAGE_MAP['pest control'];
    if (text.includes('renovation') || text.includes('construction') || text.includes('builder')) return CATEGORY_IMAGE_MAP['home renovation'];
    if (text.includes('cctv') || text.includes('security camera') || text.includes('surveillance')) return CATEGORY_IMAGE_MAP['cctv installation'];
    if (text.includes('computer') || text.includes('laptop') || text.includes('desktop')) return CATEGORY_IMAGE_MAP['computer repair'];
    if (text.includes('mobile') || text.includes('phone') || text.includes('smartphone')) return CATEGORY_IMAGE_MAP['mobile repair'];
    if (text.includes('laundry') || text.includes('ironing') || text.includes('clothes')) return CATEGORY_IMAGE_MAP['laundry service'];
    if (text.includes('car wash') || text.includes('polishing')) return CATEGORY_IMAGE_MAP['car wash'];
    if (text.includes('mechanic') || text.includes('car repair') || text.includes('vehicle')) return CATEGORY_IMAGE_MAP['mechanic'];
    return null;
  };

  const matchFromCat = findMatch(normCat);
  if (matchFromCat) return matchFromCat;

  const matchFromName = findMatch(normName);
  if (matchFromName) return matchFromName;

  const matchFromDesc = findMatch(normDesc);
  if (matchFromDesc) return matchFromDesc;

  if (normCat.includes('repair')) {
    return CATEGORY_IMAGE_MAP['repairs'];
  }

  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';
};

export const ProviderCard: React.FC<{ provider: any; onBook: () => void }> = ({ provider, onBook }) => {
  const initialImage = provider.serviceImage || provider.image_url || provider.image || getServiceWorkImage(
    provider.serviceCategory,
    provider.fullName,
    provider.description
  );
  const [imgSrc, setImgSrc] = useState(initialImage);

  useEffect(() => {
    setImgSrc(
      provider.serviceImage || provider.image_url || provider.image || getServiceWorkImage(
        provider.serviceCategory,
        provider.fullName,
        provider.description
      )
    );
  }, [provider.serviceImage, provider.image_url, provider.image, provider.serviceCategory, provider.fullName, provider.description]);

  const handleImageError = () => {
    const fallback = getServiceWorkImage(
      provider.serviceCategory,
      provider.fullName,
      provider.description
    );
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setImgSrc('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80');
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-primary bg-bg-card shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={provider.fullName}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-primary" />
              {(provider.rating || 5.0).toFixed(1)}
            </span>
            {provider.availability === 'ONLINE' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                ONLINE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                OFFLINE
              </span>
            )}
          </div>
          {provider.verified && (
             <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm backdrop-blur-sm uppercase">
               <CheckCircle className="h-3 w-3" />
               Verified
             </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-primary-text line-clamp-1">
              {provider.serviceTitle || provider.title || provider.name || provider.fullName}
            </h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
              {formatINR(provider.price)}
            </span>
          </div>
          <p className="text-sm font-semibold text-secondary-text capitalize">
            By {provider.fullName}
          </p>
          <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1.5">
            {provider.serviceCategory}
          </p>
        </div>

        {provider.description && (
          <p className="text-xs text-secondary-text line-clamp-2 mb-3 mt-1 italic">
            "{provider.description}"
          </p>
        )}

        <div className="mb-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-secondary-text">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary animate-pulse" />
            <span className="truncate">{provider.experience || provider.duration || '1-2 Hours'}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <Navigation className="h-4 w-4 text-primary" />
             <span className="truncate">2.5 km away</span>
          </div>
        </div>

        <button
          onClick={onBook}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md active:scale-[0.98]"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
