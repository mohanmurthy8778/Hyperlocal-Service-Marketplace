package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.entity.Service;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.mapper.DtoMapper;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.CloudinaryService;
import com.hyperlocalmarketplace.service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ProviderServiceImpl implements ProviderService {

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private DtoMapper dtoMapper;

    @Override
    public ProviderProfileResponse getProfile(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return dtoMapper.toProviderProfileResponse(provider);
    }

    @Override
    public ProviderProfileResponse updateProfile(String email, ProviderProfileRequest request) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        if (request.getFirstName() != null) provider.setFirstName(request.getFirstName());
        if (request.getLastName() != null) provider.setLastName(request.getLastName());
        if (request.getPhone() != null) provider.setPhone(request.getPhone());
        if (request.getGender() != null) provider.setGender(request.getGender());
        if (request.getDob() != null) provider.setDob(request.getDob());
        if (request.getAvatar() != null) provider.setAvatar(request.getAvatar());
        if (request.getBio() != null) provider.setBio(request.getBio());
        if (request.getLanguages() != null) provider.setLanguages(request.getLanguages());
        if (request.getExperience() != null) provider.setExperience(request.getExperience());
        if (request.getCategory() != null) provider.setCategory(request.getCategory());
        if (request.getSkills() != null) provider.setSkills(request.getSkills());
        if (request.getWorkingHourStart() != null) provider.setWorkingHourStart(request.getWorkingHourStart());
        if (request.getWorkingHourEnd() != null) provider.setWorkingHourEnd(request.getWorkingHourEnd());
        if (request.getAvailableDays() != null) provider.setAvailableDays(request.getAvailableDays());
        if (request.getEmergencyPhone() != null) provider.setEmergencyPhone(request.getEmergencyPhone());

        // Bank Info updates
        if (request.getAccountHolderName() != null) provider.setAccountHolderName(request.getAccountHolderName());
        if (request.getBankName() != null) provider.setBankName(request.getBankName());
        if (request.getAccountNumber() != null) provider.setAccountNumber(request.getAccountNumber());
        if (request.getIfscCode() != null) provider.setIfscCode(request.getIfscCode());
        if (request.getUpiId() != null) provider.setUpiId(request.getUpiId());

        // Social Links updates
        if (request.getWebsite() != null) provider.setWebsite(request.getWebsite());
        if (request.getFacebook() != null) provider.setFacebook(request.getFacebook());
        if (request.getInstagram() != null) provider.setInstagram(request.getInstagram());
        if (request.getLinkedin() != null) provider.setLinkedin(request.getLinkedin());

        // Notification preferences
        provider.setEmailNotifications(request.isEmailNotifications());
        provider.setSmsNotifications(request.isSmsNotifications());
        provider.setPushNotifications(request.isPushNotifications());
        provider.setBookingAlerts(request.isBookingAlerts());
        provider.setMarketingEmails(request.isMarketingEmails());

        provider = providerRepository.save(provider);
        return dtoMapper.toProviderProfileResponse(provider);
    }

    @Override
    public void uploadDocument(String email, String docName, String docType, MultipartFile file) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        try {
            String url = cloudinaryService.uploadFile(file, "provider_documents");
            Document document = Document.builder()
                    .provider(provider)
                    .documentName(docName)
                    .documentType(docType)
                    .documentUrl(url)
                    .isVerified(false)
                    .build();
            documentRepository.save(document);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload document file!");
        }
    }

    @Override
    public List<DocumentDto> getDocuments(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        return documentRepository.findByProviderId(provider.getId()).stream()
                .map(d -> DocumentDto.builder()
                        .id(d.getId())
                        .providerId(d.getProvider().getId())
                        .documentName(d.getDocumentName())
                        .documentType(d.getDocumentType())
                        .documentUrl(d.getDocumentUrl())
                        .isVerified(d.isVerified())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceDto> getProviderServices(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        return serviceRepository.findByProvider(provider).stream()
                .map(dtoMapper::toServiceDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceDto addService(String email, ServiceDto serviceDto, MultipartFile image) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Category category = categoryRepository.findById(serviceDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        String imageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80";
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadFile(image, "services");
            } catch (IOException e) {
                throw new BadRequestException("Failed to upload service image!");
            }
        }

        Service service = Service.builder()
                .provider(provider)
                .category(category)
                .name(serviceDto.getName())
                .description(serviceDto.getDescription())
                .startingPrice(serviceDto.getStartingPrice())
                .experience(serviceDto.getExperience())
                .imageUrl(imageUrl)
                .build();

        service = serviceRepository.save(service);
        return dtoMapper.toServiceDto(service);
    }

    @Override
    public ServiceDto updateService(String email, Long serviceId, ServiceDto serviceDto, MultipartFile image) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You do not own this service listing!");
        }

        if (serviceDto.getName() != null) service.setName(serviceDto.getName());
        if (serviceDto.getDescription() != null) service.setDescription(serviceDto.getDescription());
        if (serviceDto.getStartingPrice() != null) service.setStartingPrice(serviceDto.getStartingPrice());
        if (serviceDto.getExperience() != null) service.setExperience(serviceDto.getExperience());

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadFile(image, "services");
                service.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new BadRequestException("Failed to upload service image!");
            }
        }

        service = serviceRepository.save(service);
        return dtoMapper.toServiceDto(service);
    }

    @Override
    public void deleteService(String email, Long serviceId) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new UnauthorizedException("You do not own this service listing!");
        }

        serviceRepository.delete(service);
    }

    @Override
    public Map<String, Object> getEarningsReport(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        List<Payment> payments = paymentRepository.findByBookingProviderId(provider.getId());
        double totalEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL)
                .mapToDouble(Payment::getAmount)
                .sum();

        Map<String, Object> report = new HashMap<>();
        report.put("providerId", provider.getId());
        report.put("totalEarnings", totalEarnings);
        report.put("totalBookings", bookingRepository.findByProviderId(provider.getId()).size());
        report.put("completedJobs", provider.getCompletedJobs());
        report.put("paymentHistory", payments.stream().map(dtoMapper::toPaymentResponse).collect(Collectors.toList()));

        return report;
    }

    @Override
    public List<ReviewResponse> getCustomerReviews(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        return reviewRepository.findByProviderId(provider.getId()).stream()
                .map(dtoMapper::toReviewResponse)
                .collect(Collectors.toList());
    }

    // New Module specific methods
    @Override
    public ProviderProfileDTO getProviderProfile(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return mapToProviderProfileDTO(provider);
    }

    @Override
    public ProviderProfileDTO updateProviderProfile(String email, UpdateProviderDTO request) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        if (request.getFirstName() != null) provider.setFirstName(request.getFirstName());
        if (request.getLastName() != null) provider.setLastName(request.getLastName());
        if (request.getPhone() != null) provider.setPhone(request.getPhone());
        if (request.getAvatar() != null) provider.setAvatar(request.getAvatar());
        if (request.getBio() != null) provider.setBio(request.getBio());
        if (request.getExperience() != null) provider.setExperience(request.getExperience());
        if (request.getSkills() != null) provider.setSkills(request.getSkills());
        if (request.getLanguages() != null) provider.setLanguages(request.getLanguages());
        if (request.getWorkingHours() != null) {
            String[] hours = request.getWorkingHours().split("-");
            if (hours.length == 2) {
                provider.setWorkingHourStart(hours[0].trim());
                provider.setWorkingHourEnd(hours[1].trim());
            }
        }
        if (request.getAvailableDays() != null) provider.setAvailableDays(request.getAvailableDays());

        if (request.getLocation() != null && !request.getLocation().isEmpty()) {
            List<Address> addresses = addressRepository.findByUserId(provider.getUser().getId());
            Address address = addresses.stream().filter(Address::isDefault).findFirst()
                    .orElse(addresses.isEmpty() ? null : addresses.get(0));

            if (address == null) {
                address = Address.builder()
                        .user(provider.getUser())
                        .houseNumber("N/A")
                        .street("N/A")
                        .area("N/A")
                        .city(request.getLocation())
                        .district(request.getLocation())
                        .state(request.getLocation())
                        .country("India")
                        .postalCode("000000")
                        .isDefault(true)
                        .build();
            } else {
                address.setCity(request.getLocation());
            }
            addressRepository.save(address);
        }

        provider = providerRepository.save(provider);
        return mapToProviderProfileDTO(provider);
    }

    @Override
    public String uploadProfileImage(String email, MultipartFile image) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        try {
            String url = cloudinaryService.uploadFile(image, "provider_avatars");
            provider.setAvatar(url);
            providerRepository.save(provider);
            return url;
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload profile image");
        }
    }

    @Override
    public void uploadProviderDocument(String email, String docName, String docType, MultipartFile file) {
        uploadDocument(email, docName, docType, file);
    }

    @Override
    public DashboardDTO getProviderDashboard(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        List<Booking> providerBookings = bookingRepository.findByProviderId(provider.getId());

        List<BookingResponseDTO> upcoming = new ArrayList<>();
        List<BookingResponseDTO> completed = new ArrayList<>();
        List<BookingResponseDTO> cancelled = new ArrayList<>();

        for (Booking booking : providerBookings) {
            BookingResponseDTO dto = mapToBookingResponseDTO(booking);
            switch (booking.getStatus()) {
                case PENDING:
                case ACCEPTED:
                    upcoming.add(dto);
                    break;
                case COMPLETED:
                    completed.add(dto);
                    break;
                case CANCELLED:
                case REJECTED:
                    cancelled.add(dto);
                    break;
            }
        }

        List<ReviewDTO> recentReviews = reviewRepository.findByProviderId(provider.getId()).stream()
                .map(r -> ReviewDTO.builder()
                        .id(r.getId())
                        .bookingId(r.getBooking().getId())
                        .customerId(r.getCustomer().getId())
                        .customerName(r.getCustomer().getFirstName() + " " + r.getCustomer().getLastName())
                        .customerAvatar(r.getCustomer().getAvatar())
                        .providerId(provider.getId())
                        .providerName(provider.getFirstName() + " " + provider.getLastName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .reviewDate(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<NotificationDTO> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(provider.getUser().getId()).stream()
                .map(n -> NotificationDTO.builder()
                        .id(n.getId())
                        .userId(n.getUser().getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Calculate earnings for dashboard
        List<Payment> payments = paymentRepository.findByBookingProviderId(provider.getId());
        double totalEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL)
                .mapToDouble(Payment::getAmount)
                .sum();

        double todayEarnings = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.SUCCESSFUL 
                             && p.getPaymentDate().toLocalDate().equals(LocalDate.now()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double pendingPayments = payments.stream()
                .filter(p -> p.getStatus() == com.hyperlocalmarketplace.enums.PaymentStatus.PENDING)
                .mapToDouble(Payment::getAmount)
                .sum();

        long totalCustomers = providerBookings.stream()
                .map(Booking::getCustomer)
                .distinct()
                .count();

        return DashboardDTO.builder()
                .upcomingBookings(upcoming)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .recentReviews(recentReviews)
                .notifications(notifications)
                .totalBookings((long) providerBookings.size())
                .todayEarnings(todayEarnings)
                .weeklyEarnings(totalEarnings * 0.25)
                .monthlyEarnings(totalEarnings * 0.8)
                .totalEarnings(totalEarnings)
                .completedJobs(provider.getCompletedJobs())
                .pendingPayments(pendingPayments)
                .averageRating(provider.getRating())
                .totalCustomers((int) totalCustomers)
                .build();
    }

    private ProviderProfileDTO mapToProviderProfileDTO(Provider provider) {
        List<Address> addresses = addressRepository.findByUserId(provider.getUser().getId());
        String location = addresses.stream()
                .filter(Address::isDefault)
                .map(a -> a.getCity() + ", " + a.getState())
                .findFirst()
                .orElse(addresses.isEmpty() ? "Not Specified" : addresses.get(0).getCity() + ", " + addresses.get(0).getState());

        List<Review> reviews = reviewRepository.findByProviderId(provider.getId());
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(provider.getRating());

        return ProviderProfileDTO.builder()
                .id(provider.getId())
                .email(provider.getUser().getEmail())
                .fullName(provider.getFirstName() + " " + provider.getLastName())
                .firstName(provider.getFirstName())
                .lastName(provider.getLastName())
                .phone(provider.getPhone())
                .avatar(provider.getAvatar())
                .bio(provider.getBio())
                .experience(provider.getExperience())
                .skills(provider.getSkills())
                .category(provider.getCategory())
                .languages(provider.getLanguages())
                .workingHours(provider.getWorkingHourStart() != null && provider.getWorkingHourEnd() != null ? 
                              provider.getWorkingHourStart() + " - " + provider.getWorkingHourEnd() : "Not Set")
                .availableDays(provider.getAvailableDays())
                .location(location)
                .verificationStatus(provider.isVerified() ? "APPROVED" : "PENDING")
                .averageRating(avgRating)
                .totalReviews(reviews.size())
                .completedJobs(provider.getCompletedJobs())
                .memberSince(provider.getJoinedDate())
                .build();
    }

    private BookingResponseDTO mapToBookingResponseDTO(Booking booking) {
        String customerName = booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName();
        String providerName = booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName();
        
        List<Address> addresses = addressRepository.findByUserId(booking.getCustomer().getUser().getId());
        Address defaultOrFirst = addresses.stream()
                .filter(Address::isDefault)
                .findFirst()
                .orElse(addresses.isEmpty() ? null : addresses.get(0));

        AddressDTO addressDTO = null;
        if (defaultOrFirst != null) {
            addressDTO = AddressDTO.builder()
                    .id(defaultOrFirst.getId())
                    .houseNumber(defaultOrFirst.getHouseNumber())
                    .street(defaultOrFirst.getStreet())
                    .area(defaultOrFirst.getArea())
                    .city(defaultOrFirst.getCity())
                    .district(defaultOrFirst.getDistrict())
                    .state(defaultOrFirst.getState())
                    .country(defaultOrFirst.getCountry())
                    .postalCode(defaultOrFirst.getPostalCode())
                    .latitude(defaultOrFirst.getLatitude())
                    .longitude(defaultOrFirst.getLongitude())
                    .isDefault(defaultOrFirst.isDefault())
                    .build();
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
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "PENDING")
                .address(addressDTO)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
