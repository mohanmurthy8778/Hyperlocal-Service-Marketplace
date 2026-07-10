package com.hyperlocalmarketplace.service.impl;

import com.hyperlocalmarketplace.dto.AddressDTO;
import com.hyperlocalmarketplace.entity.Address;
import com.hyperlocalmarketplace.entity.User;
import com.hyperlocalmarketplace.exception.ResourceNotFoundException;
import com.hyperlocalmarketplace.exception.UnauthorizedException;
import com.hyperlocalmarketplace.repository.AddressRepository;
import com.hyperlocalmarketplace.repository.UserRepository;
import com.hyperlocalmarketplace.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AddressDTO addAddress(String email, AddressDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Address address = Address.builder()
                .user(user)
                .houseNumber(dto.getHouseNumber())
                .street(dto.getStreet())
                .area(dto.getArea())
                .city(dto.getCity())
                .district(dto.getDistrict())
                .state(dto.getState())
                .country(dto.getCountry())
                .postalCode(dto.getPostalCode())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .isDefault(dto.isDefault())
                .build();

        if (dto.isDefault()) {
            resetDefaultAddresses(user.getId());
        } else {
            List<Address> existing = addressRepository.findByUserId(user.getId());
            if (existing.isEmpty()) {
                address.setDefault(true);
            }
        }

        Address saved = addressRepository.save(address);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public AddressDTO updateAddress(String email, Long id, AddressDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to update this address");
        }

        address.setHouseNumber(dto.getHouseNumber());
        address.setStreet(dto.getStreet());
        address.setArea(dto.getArea());
        address.setCity(dto.getCity());
        address.setDistrict(dto.getDistrict());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        address.setPostalCode(dto.getPostalCode());
        address.setLatitude(dto.getLatitude());
        address.setLongitude(dto.getLongitude());

        if (dto.isDefault() && !address.isDefault()) {
            resetDefaultAddresses(user.getId());
            address.setDefault(true);
        }

        Address updated = addressRepository.save(address);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this address");
        }

        addressRepository.delete(address);

        if (address.isDefault()) {
            List<Address> existing = addressRepository.findByUserId(user.getId());
            if (!existing.isEmpty()) {
                Address first = existing.get(0);
                first.setDefault(true);
                addressRepository.save(first);
            }
        }
    }

    @Override
    public List<AddressDTO> getAllAddresses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AddressDTO getDefaultAddress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return addressRepository.findByUserId(user.getId())
                .stream()
                .filter(Address::isDefault)
                .findFirst()
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("No default address found"));
    }

    @Override
    @Transactional
    public void setDefaultAddress(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to set this address as default");
        }

        resetDefaultAddresses(user.getId());
        address.setDefault(true);
        addressRepository.save(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }

    private AddressDTO mapToDTO(Address address) {
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
}
