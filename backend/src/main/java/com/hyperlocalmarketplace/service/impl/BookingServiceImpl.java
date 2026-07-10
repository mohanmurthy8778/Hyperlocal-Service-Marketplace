package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.enums.BookingStatus;
import com.hyperlocalmarketplace.enums.RoleType;
import com.hyperlocalmarketplace.dto.*;
import com.hyperlocalmarketplace.entity.*;
import com.hyperlocalmarketplace.exception.BadRequestException;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.mapper.DtoMapper;
import com.hyperlocalmarketplace.repository.*;
import com.hyperlocalmarketplace.service.BookingService;
import com.hyperlocalmarketplace.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private DtoMapper dtoMapper;

    @Override
    @Transactional
    public BookingResponse createBooking(String customerEmail, BookingRequest request) {
        Customer customer = customerRepository.findByUserEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        com.hyperlocalmarketplace.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        Booking booking = Booking.builder()
                .customer(customer)
                .service(service)
                .provider(service.getProvider())
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .status(BookingStatus.PENDING)
                .notes(request.getNotes())
                .build();

        booking = bookingRepository.save(booking);

        // Notify Provider
        notificationService.sendNotification(
                service.getProvider().getUser(),
                "New Booking Request",
                "You have received a new booking request for " + service.getName() + " on " + request.getBookingDate()
        );

        return dtoMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(String userEmail, Long bookingId, String status) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        BookingStatus newStatus;
        try {
            newStatus = BookingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status value");
        }

        // Verify Roles
        if (user.getRole().getName() == RoleType.ROLE_PROVIDER) {
            if (!booking.getProvider().getUser().getEmail().equals(userEmail)) {
                throw new UnauthorizedException("You are not authorized to edit this booking");
            }
        } else if (user.getRole().getName() == RoleType.ROLE_CUSTOMER) {
            if (!booking.getCustomer().getUser().getEmail().equals(userEmail)) {
                throw new UnauthorizedException("You are not authorized to edit this booking");
            }
            if (newStatus != BookingStatus.CANCELLED) {
                throw new BadRequestException("Customers can only cancel bookings");
            }
        }

        booking.setStatus(newStatus);

        if (newStatus == BookingStatus.COMPLETED) {
            Provider provider = booking.getProvider();
            provider.setCompletedJobs(provider.getCompletedJobs() + 1);
            providerRepository.save(provider);
        }

        booking = bookingRepository.save(booking);

        // Fire Notifications
        String message = "Your booking for " + booking.getService().getName() + " status is updated to: " + newStatus;
        notificationService.sendNotification(booking.getCustomer().getUser(), "Booking Status Updated", message);
        notificationService.sendNotification(booking.getProvider().getUser(), "Booking Status Updated", message);

        return dtoMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String userEmail, Long bookingId) {
        return updateBookingStatus(userEmail, bookingId, "CANCELLED");
    }

    @Override
    @Transactional
    public BookingResponse acceptBooking(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, "ACCEPTED");
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, "REJECTED");
    }

    @Override
    @Transactional
    public BookingResponse startService(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, "IN_PROGRESS");
    }

    @Override
    @Transactional
    public BookingResponse completeBooking(String providerEmail, Long bookingId) {
        return updateBookingStatus(providerEmail, bookingId, "COMPLETED");
    }

    @Override
    public List<BookingResponse> getBookingsForCustomer(String customerEmail) {
        Customer customer = customerRepository.findByUserEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        return bookingRepository.findByCustomer(customer).stream()
                .map(dtoMapper::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsForProvider(String providerEmail) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return bookingRepository.findByProvider(provider).stream()
                .map(dtoMapper::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingDetails(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getUser().getEmail().equals(userEmail) && 
            !booking.getProvider().getUser().getEmail().equals(userEmail) &&
            !userRepository.findByEmail(userEmail).map(u -> u.getRole().getName() == RoleType.ROLE_ADMIN).orElse(false)) {
            throw new UnauthorizedException("You do not have permission to view this booking");
        }

        return dtoMapper.toBookingResponse(booking);
    }

    @Override
    public List<String> getBookingTimeline(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        List<String> timeline = new ArrayList<>();
        timeline.add("Created at " + booking.getCreatedAt());
        
        if (booking.getStatus() == BookingStatus.ACCEPTED || booking.getStatus() == BookingStatus.COMPLETED) {
            timeline.add("Accepted by Provider");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            timeline.add("Rejected by Provider");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            timeline.add("Cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            timeline.add("Marked Complete on " + booking.getUpdatedAt());
        }

        return timeline;
    }

    // New Customer-specific Module methods
    @Override
    @Transactional
    public BookingResponseDTO createCustomerBooking(String email, BookingRequestDTO request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        com.hyperlocalmarketplace.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found with id: " + request.getServiceId()));

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        if (!address.getUser().getId().equals(customer.getUser().getId())) {
            throw new UnauthorizedException("You are not authorized to use this address");
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .service(service)
                .provider(service.getProvider())
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .status(BookingStatus.PENDING)
                .notes(request.getSpecialInstructions())
                .build();

        booking = bookingRepository.save(booking);

        notificationService.sendNotification(
                service.getProvider().getUser(),
                "New Booking Request",
                "You have received a new booking request for " + service.getName() + " on " + request.getBookingDate()
        );

        return mapToBookingResponseDTO(booking, address);
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelCustomerBooking(String email, Long id) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You do not have permission to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel completed bookings.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getProvider().getUser(),
                "Booking Cancelled",
                "The booking for " + booking.getService().getName() + " was cancelled by the customer."
        );

        return mapToBookingResponseDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getCustomerBookingHistory(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        return bookingRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToBookingResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getCustomerBookingDetails(String email, Long id) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to view this booking");
        }

        return mapToBookingResponseDTO(booking);
    }

    private BookingResponseDTO mapToBookingResponseDTO(Booking booking, Address address) {
        String customerName = booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName();
        String providerName = booking.getProvider().getFirstName() + " " + booking.getProvider().getLastName();
        
        AddressDTO addressDTO = null;
        if (address != null) {
            addressDTO = AddressDTO.builder()
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

    private BookingResponseDTO mapToBookingResponseDTO(Booking booking) {
        List<Address> addresses = addressRepository.findByUserId(booking.getCustomer().getUser().getId());
        Address defaultOrFirst = addresses.stream()
                .filter(Address::isDefault)
                .findFirst()
                .orElse(addresses.isEmpty() ? null : addresses.get(0));
        return mapToBookingResponseDTO(booking, defaultOrFirst);
    }
}
