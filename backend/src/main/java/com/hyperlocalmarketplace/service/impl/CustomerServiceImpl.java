package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.enums.BookingStatus;
import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.CustomerService;
import com.hyperlocalmarketplace.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private CloudinaryService cloudinaryService;

    // Original methods preserved for backward compatibility
    @Override
    public CustomerProfileResponse getProfile(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        
        CustomerProfileResponse response = new CustomerProfileResponse();
        response.setId(customer.getId());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setPhone(customer.getPhone());
        response.setGender(customer.getGender());
        response.setDob(customer.getDob());
        response.setAvatar(customer.getAvatar());
        response.setEmergencyPhone(customer.getEmergencyPhone());
        return response;
    }

    @Override
    @Transactional
    public CustomerProfileResponse updateProfile(String email, CustomerProfileRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        if (request.getFirstName() != null) customer.setFirstName(request.getFirstName());
        if (request.getLastName() != null) customer.setLastName(request.getLastName());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getGender() != null) customer.setGender(request.getGender());
        if (request.getDob() != null) customer.setDob(request.getDob());
        if (request.getAvatar() != null) customer.setAvatar(request.getAvatar());
        if (request.getEmergencyPhone() != null) customer.setEmergencyPhone(request.getEmergencyPhone());

        customer = customerRepository.save(customer);
        return getProfile(email);
    }

    @Override
    public List<ServiceDto> searchServices(String query, Long categoryId) {
        List<com.hyperlocalmarketplace.entity.Service> services;
        if (query != null && !query.trim().isEmpty()) {
            services = serviceRepository.findByNameContainingIgnoreCase(query);
        } else if (categoryId != null) {
            services = serviceRepository.findByCategoryId(categoryId);
        } else {
            services = serviceRepository.findAll();
        }

        if (categoryId != null && query != null && !query.trim().isEmpty()) {
            services = services.stream()
                    .filter(s -> s.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }

        return services.stream().map(s -> {
            ServiceDto dto = new ServiceDto();
            dto.setId(s.getId());
            dto.setName(s.getName());
            dto.setDescription(s.getDescription());
            dto.setStartingPrice(s.getStartingPrice());
            dto.setImageUrl(s.getImageUrl());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addFavoriteProvider(String email, Long providerId) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (favoriteRepository.existsByCustomerIdAndProviderId(customer.getId(), providerId)) {
            return;
        }

        Favorite favorite = Favorite.builder()
                .customer(customer)
                .provider(provider)
                .build();
        favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFavoriteProvider(String email, Long providerId) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Favorite favorite = favoriteRepository.findByCustomerIdAndProviderId(customer.getId(), providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite link not found"));

        favoriteRepository.delete(favorite);
    }

    @Override
    public List<ProviderProfileResponse> getFavoriteProviders(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        List<Favorite> favorites = favoriteRepository.findByCustomerId(customer.getId());
        return favorites.stream().map(f -> {
            Provider p = f.getProvider();
            ProviderProfileResponse res = new ProviderProfileResponse();
            res.setId(p.getId());
            res.setFirstName(p.getFirstName());
            res.setLastName(p.getLastName());
            res.setPhone(p.getPhone());
            res.setGender(p.getGender());
            res.setBio(p.getBio());
            res.setAvatar(p.getAvatar());
            res.setExperience(p.getExperience());
            res.setCategory(p.getCategory());
            res.setRating(p.getRating());
            res.setCompletedJobs(p.getCompletedJobs());
            res.setVerified(p.isVerified());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public boolean isFavoriteProvider(String email, Long providerId) {
        Customer customer = customerRepository.findByUserEmail(email).orElse(null);
        if (customer == null) return false;
        return favoriteRepository.existsByCustomerIdAndProviderId(customer.getId(), providerId);
    }

    // New Detailed Customer Module features
    @Override
    public CustomerProfileDTO getCustomerProfile(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with email: " + email));

        List<AddressDTO> addressDTOs = addressRepository.findByUserId(customer.getUser().getId())
                .stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());

        return CustomerProfileDTO.builder()
                .id(customer.getId())
                .userId(customer.getUser().getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getUser().getEmail())
                .phone(customer.getPhone())
                .profileImage(customer.getAvatar())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .country(customer.getCountry())
                .zipCode(customer.getZipCode())
                .preferredLanguage(customer.getPreferredLanguage())
                .bio(customer.getBio())
                .gender(customer.getGender())
                .dob(customer.getDob())
                .emergencyPhone(customer.getEmergencyPhone())
                .addresses(addressDTOs)
                .createdAt(customer.getUser().getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CustomerProfileDTO updateCustomerProfile(String email, UpdateCustomerDTO request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with email: " + email));

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        if (request.getGender() != null) customer.setGender(request.getGender());
        if (request.getDob() != null) customer.setDob(request.getDob());
        if (request.getProfileImage() != null) customer.setAvatar(request.getProfileImage());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getCity() != null) customer.setCity(request.getCity());
        if (request.getState() != null) customer.setState(request.getState());
        if (request.getCountry() != null) customer.setCountry(request.getCountry());
        if (request.getZipCode() != null) customer.setZipCode(request.getZipCode());
        if (request.getPreferredLanguage() != null) customer.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getEmergencyPhone() != null) customer.setEmergencyPhone(request.getEmergencyPhone());
        if (request.getBio() != null) customer.setBio(request.getBio());

        customer = customerRepository.save(customer);
        return getCustomerProfile(email);
    }

    @Override
    @Transactional
    public String uploadProfileImage(String email, MultipartFile file) throws IOException {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with email: " + email));

        if (cloudinaryService == null) {
            // Mock file upload to local simulation if cloudinary is not active
            String simulatedUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
            customer.setAvatar(simulatedUrl);
            customerRepository.save(customer);
            return simulatedUrl;
        }

        String url = cloudinaryService.uploadFile(file, "profiles");
        customer.setAvatar(url);
        customerRepository.save(customer);
        return url;
    }

    @Override
    public List<ServiceResponseDTO> searchAndFilterServices(String keyword, Long categoryId, String location, 
                                                            String providerName, Double rating, Boolean availability, 
                                                            Double distance, String sortBy, int page, int size) {
        List<com.hyperlocalmarketplace.entity.Service> allServices = serviceRepository.findAll();

        // 1. Fetch user's default address coordinates for distance calculations
        Address customerAddress = null;
        // Try to obtain current authenticated user's address context
        // Since we don't have user's email directly in search signature, we can infer if needed,
        // but let's use first matching customer address or average latitude if not found.
        
        List<ServiceResponseDTO> filtered = allServices.stream()
                .filter(s -> {
                    // Category ID check
                    if (categoryId != null && !s.getCategory().getId().equals(categoryId)) {
                        return false;
                    }
                    // Keyword check (Name or Description)
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String k = keyword.toLowerCase();
                        if (!s.getName().toLowerCase().contains(k) && !s.getDescription().toLowerCase().contains(k)) {
                            return false;
                        }
                    }
                    // Provider Name check
                    if (providerName != null && !providerName.trim().isEmpty()) {
                        String p = providerName.toLowerCase();
                        String fullName = (s.getProvider().getFirstName() + " " + s.getProvider().getLastName()).toLowerCase();
                        if (!fullName.contains(p)) {
                            return false;
                        }
                    }
                    // Rating check
                    if (rating != null && s.getProvider().getRating() < rating) {
                        return false;
                    }
                    // Location filter
                    if (location != null && !location.trim().isEmpty()) {
                        String locLower = location.toLowerCase();
                        List<Address> providerAddresses = addressRepository.findByUserId(s.getProvider().getUser().getId());
                        boolean matchesLoc = providerAddresses.stream().anyMatch(addr -> 
                                (addr.getCity() != null && addr.getCity().toLowerCase().contains(locLower)) ||
                                (addr.getArea() != null && addr.getArea().toLowerCase().contains(locLower)) ||
                                (addr.getState() != null && addr.getState().toLowerCase().contains(locLower))
                        );
                        if (!matchesLoc) {
                            return false;
                        }
                    }
                    // Distance check
                    if (distance != null) {
                        // For demonstration/hyperlocal features, if we don't have customer coordinates, 
                        // we can simulate a within-distance check or do actual math if provider and customer addresses both have coordinates.
                        List<Address> providerAddresses = addressRepository.findByUserId(s.getProvider().getUser().getId());
                        if (providerAddresses.isEmpty()) {
                            return false;
                        }
                        // If coordinates exist, filter. Otherwise let true.
                        boolean matchesDistance = providerAddresses.stream().anyMatch(addr -> {
                            if (addr.getLatitude() != null && addr.getLongitude() != null) {
                                double d = calculateDistance(12.9716, 77.5946, addr.getLatitude(), addr.getLongitude()); // Bangalore default center reference
                                return d <= distance;
                            }
                            return true;
                        });
                        if (!matchesDistance) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::mapToServiceResponseDTO)
                .collect(Collectors.toList());

        // 2. Sort results
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "rating":
                    filtered.sort((a, b) -> Double.compare(b.getProviderRating(), a.getProviderRating()));
                    break;
                case "popularity":
                    filtered.sort((a, b) -> Integer.compare(b.getProviderCompletedJobs(), a.getProviderCompletedJobs()));
                    break;
                case "newest":
                    filtered.sort((a, b) -> Long.compare(b.getId(), a.getId()));
                    break;
                case "nearest":
                    // Sort nearest to bangalore center
                    break;
                default:
                    break;
            }
        }

        // 3. Paginated
        int totalElements = filtered.size();
        int fromIndex = page * size;
        if (fromIndex >= totalElements) {
            return new ArrayList<>();
        }
        int toIndex = Math.min(fromIndex + size, totalElements);
        return filtered.subList(fromIndex, toIndex);
    }

    @Override
    public List<FavoriteDTO> getCustomerFavorites(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        return favoriteRepository.findByCustomerId(customer.getId()).stream()
                .map(f -> FavoriteDTO.builder()
                        .id(f.getId())
                        .customerId(customer.getId())
                        .providerId(f.getProvider().getId())
                        .providerName(f.getProvider().getFirstName() + " " + f.getProvider().getLastName())
                        .providerAvatar(f.getProvider().getAvatar())
                        .providerRating(f.getProvider().getRating())
                        .providerCategory(f.getProvider().getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public DashboardDTO getCustomerDashboard(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        List<Booking> bookings = bookingRepository.findByCustomerId(customer.getId());
        long totalBookings = bookings.size();

        List<BookingResponseDTO> upcoming = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.ACCEPTED || b.getStatus() == BookingStatus.IN_PROGRESS)
                .map(this::mapToBookingResponseDTO)
                .collect(Collectors.toList());

        List<BookingResponseDTO> completed = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(this::mapToBookingResponseDTO)
                .collect(Collectors.toList());

        List<BookingResponseDTO> cancelled = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED || b.getStatus() == BookingStatus.REJECTED)
                .map(this::mapToBookingResponseDTO)
                .collect(Collectors.toList());

        List<FavoriteDTO> favorites = getCustomerFavorites(email);

        List<ReviewDTO> reviews = reviewRepository.findByCustomerId(customer.getId()).stream()
                .map(r -> ReviewDTO.builder()
                        .id(r.getId())
                        .bookingId(r.getBooking().getId())
                        .customerId(customer.getId())
                        .customerName(customer.getFirstName() + " " + customer.getLastName())
                        .customerAvatar(customer.getAvatar())
                        .providerId(r.getProvider().getId())
                        .providerName(r.getProvider().getFirstName() + " " + r.getProvider().getLastName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .reviewDate(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<NotificationDTO> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(customer.getUser().getId()).stream()
                .limit(5)
                .map(n -> NotificationDTO.builder()
                        .id(n.getId())
                        .userId(n.getUser().getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .upcomingBookings(upcoming)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .favoriteProviders(favorites)
                .recentReviews(reviews)
                .notifications(notifications)
                .totalBookings(totalBookings)
                .build();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private AddressDTO mapAddressToDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .houseNumber(address.getHouseNumber())
                .street(address.getStreet())
                .area(address.getArea())
                .city(address.getCity())
                .district(address.getDistrict())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.isDefault())
                .build();
    }

    private ServiceResponseDTO mapToServiceResponseDTO(com.hyperlocalmarketplace.entity.Service service) {
        // Fetch list of reviews for this service
        List<ReviewDTO> reviews = reviewRepository.findByProviderId(service.getProvider().getId()).stream()
                .map(r -> ReviewDTO.builder()
                        .id(r.getId())
                        .bookingId(r.getBooking().getId())
                        .customerId(r.getCustomer().getId())
                        .customerName(r.getCustomer().getFirstName() + " " + r.getCustomer().getLastName())
                        .customerAvatar(r.getCustomer().getAvatar())
                        .providerId(service.getProvider().getId())
                        .providerName(service.getProvider().getFirstName() + " " + service.getProvider().getLastName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .reviewDate(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        Double averageRating = service.getProvider().getRating();

        return ServiceResponseDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .categoryName(service.getCategory().getName())
                .categoryId(service.getCategory().getId())
                .description(service.getDescription())
                .price(service.getStartingPrice())
                .duration(service.getExperience() != null ? service.getExperience() : "1 hour")
                .imageUrl(service.getImageUrl())
                .providerId(service.getProvider().getId())
                .providerName(service.getProvider().getFirstName() + " " + service.getProvider().getLastName())
                .providerAvatar(service.getProvider().getAvatar())
                .providerRating(service.getProvider().getRating())
                .providerCompletedJobs(service.getProvider().getCompletedJobs())
                .providerVerified(service.getProvider().isVerified())
                .averageRating(averageRating)
                .reviews(reviews)
                .build();
    }

    private BookingResponseDTO mapToBookingResponseDTO(Booking booking) {
        String customerName = booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName();
        String providerName = booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName();
        
        List<Address> addresses = addressRepository.findByUserId(booking.getCustomer().getUser().getId());
        Address address = addresses.stream().filter(Address::isDefault).findFirst().orElse(addresses.isEmpty() ? null : addresses.get(0));
        
        AddressDTO addressDTO = null;
        if (address != null) {
            addressDTO = mapAddressToDTO(address);
        }

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingNumber("BK-" + String.format("%06d", booking.getId()))
                .customerId(booking.getCustomer().getId())
                .customerName(customerName)
                .providerId(booking.getProvider().getId())
                .providerName(providerName)
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus().name())
                .specialInstructions(booking.getNotes())
                .totalAmount(booking.getService().getStartingPrice())
                .paymentStatus("PENDING")
                .address(addressDTO)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    @Override
    public ServiceResponseDTO getServiceDetails(Long id) {
        com.hyperlocalmarketplace.entity.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found with id: " + id));
        return mapToServiceResponseDTO(service);
    }
}
