import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerApi } from '../api/customerApi';
import { bookingApi } from '../api/bookingApi';
import { Service, Booking } from '../types';

interface CustomerContextType {
  addresses: any[];
  favorites: string[];
  services: Service[];
  bookings: Booking[];
  fetchAddresses: () => Promise<void>;
  addAddress: (address: any) => Promise<any>;
  updateAddress: (id: number | string, address: any) => Promise<any>;
  deleteAddress: (id: number | string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (providerId: string | number) => Promise<void>;
  searchServices: (params?: any) => Promise<Service[]>;
  getServiceDetails: (id: number | string) => Promise<Service>;
  addBooking: (bookingData: any) => Promise<Booking>;
  fetchBookingHistory: () => Promise<Booking[]>;
  cancelBooking: (id: number | string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchAddresses = async () => {
    try {
      const res = await customerApi.getAddresses();
      setAddresses(res.data || res || []);
    } catch (e) {
      console.error("Failed to fetch customer addresses:", e);
    }
  };

  const addAddress = async (address: any) => {
    const res = await customerApi.addAddress(address);
    await fetchAddresses();
    return res.data || res;
  };

  const updateAddress = async (id: number | string, address: any) => {
    const res = await customerApi.updateAddress(id, address);
    await fetchAddresses();
    return res.data || res;
  };

  const deleteAddress = async (id: number | string) => {
    await customerApi.deleteAddress(id);
    await fetchAddresses();
  };

  const fetchFavorites = async () => {
    try {
      const res = await customerApi.getFavorites();
      const list = res.data || res || [];
      setFavorites(list.map((f: any) => String(f.providerId || f.id || '')));
    } catch (e) {
      console.error("Failed to fetch favorites:", e);
    }
  };

  const toggleFavorite = async (providerId: string | number) => {
    try {
      const idStr = String(providerId);
      if (favorites.includes(idStr)) {
        await customerApi.removeFavorite(providerId);
        setFavorites(prev => prev.filter(f => f !== idStr));
      } else {
        await customerApi.addFavorite(providerId);
        setFavorites(prev => [...prev, idStr]);
      }
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
    }
  };

  const searchServices = async (params?: any): Promise<Service[]> => {
    try {
      const res = await customerApi.searchServices(params);
      const list = res.data || res || [];
      // map to frontend interface
      const mapped: Service[] = list.map((s: any) => ({
        id: String(s.id || ''),
        title: s.title || s.name || '',
        categoryId: String(s.categoryId || ''),
        categoryName: s.categoryName || '',
        providerId: String(s.providerId || ''),
        providerName: s.providerName || '',
        providerAvatar: s.providerAvatar || '',
        providerRating: s.providerRating || 5.0,
        description: s.description || '',
        price: s.price || 0,
        duration: s.duration || '',
        rating: s.rating || 5.0,
        reviewCount: s.reviewCount || 0,
        location: s.location || '',
        images: s.images || (s.imageUrl ? [s.imageUrl] : []),
        features: s.features || [],
      }));
      setServices(mapped);
      return mapped;
    } catch (e) {
      console.error("Failed to search services:", e);
      return [];
    }
  };

  const getServiceDetails = async (id: number | string): Promise<Service> => {
    const res = await customerApi.getServiceDetails(id);
    const s = res.data || res;
    return {
      id: String(s.id || ''),
      title: s.title || s.name || '',
      categoryId: String(s.categoryId || ''),
      categoryName: s.categoryName || '',
      providerId: String(s.providerId || ''),
      providerName: s.providerName || '',
      providerAvatar: s.providerAvatar || '',
      providerRating: s.providerRating || 5.0,
      description: s.description || '',
      price: s.price || 0,
      duration: s.duration || '',
      rating: s.rating || 5.0,
      reviewCount: s.reviewCount || 0,
      location: s.location || '',
      images: s.images || (s.imageUrl ? [s.imageUrl] : []),
      features: s.features || [],
    };
  };

  const fetchBookingHistory = async (): Promise<Booking[]> => {
    try {
      const res = await customerApi.getBookingHistory();
      const list = res.data || res || [];
      const mapped: Booking[] = list.map((b: any) => ({
        id: String(b.id || ''),
        serviceId: String(b.serviceId || ''),
        serviceTitle: b.serviceTitle || '',
        categoryName: b.categoryName || '',
        providerId: String(b.providerId || ''),
        providerName: b.providerName || '',
        providerAvatar: b.providerAvatar || '',
        customerId: String(b.customerId || ''),
        customerName: b.customerName || '',
        customerAvatar: b.customerAvatar || '',
        date: b.bookingDate || b.date || '',
        time: b.bookingTime || b.time || '',
        status: (b.status || 'pending').toLowerCase() as any,
        totalPrice: b.totalPrice || b.amount || 0,
        address: b.address || '',
        paymentStatus: (b.paymentStatus || 'pending').toLowerCase() as any,
        notes: b.notes || '',
        rating: b.rating,
        review: b.reviewComment || b.review,
      }));
      setBookings(mapped);
      return mapped;
    } catch (e) {
      console.error("Failed to fetch customer booking history:", e);
      return [];
    }
  };

  const addBooking = async (bookingData: any): Promise<Booking> => {
    // BookingRequestDTO matches backend structure
    const payload = {
      serviceId: Number(bookingData.serviceId),
      bookingDate: bookingData.date || bookingData.bookingDate,
      bookingTime: bookingData.time || bookingData.bookingTime,
      addressId: Number(bookingData.addressId || 1), // backend expects addressId
      notes: bookingData.notes || '',
    };
    const res = await customerApi.bookService(payload);
    const b = res.data || res;
    await fetchBookingHistory();
    return {
      id: String(b.id || ''),
      serviceId: String(b.serviceId || ''),
      serviceTitle: b.serviceTitle || '',
      categoryName: b.categoryName || '',
      providerId: String(b.providerId || ''),
      providerName: b.providerName || '',
      providerAvatar: b.providerAvatar || '',
      customerId: String(b.customerId || ''),
      customerName: b.customerName || '',
      customerAvatar: b.customerAvatar || '',
      date: b.bookingDate || b.date || '',
      time: b.bookingTime || b.time || '',
      status: (b.status || 'pending').toLowerCase() as any,
      totalPrice: b.totalPrice || b.amount || 0,
      address: b.address || '',
      paymentStatus: (b.paymentStatus || 'pending').toLowerCase() as any,
      notes: b.notes || '',
    };
  };

  const cancelBooking = async (id: number | string) => {
    await customerApi.cancelBooking(id);
    await fetchBookingHistory();
  };

  return (
    <CustomerContext.Provider value={{
      addresses,
      favorites,
      services,
      bookings,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      fetchFavorites,
      toggleFavorite,
      searchServices,
      getServiceDetails,
      addBooking,
      fetchBookingHistory,
      cancelBooking,
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
