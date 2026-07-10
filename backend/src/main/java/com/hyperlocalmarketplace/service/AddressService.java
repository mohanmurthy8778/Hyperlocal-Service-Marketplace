package com.hyperlocalmarketplace.service;

import com.hyperlocalmarketplace.dto.AddressDTO;
import java.util.List;

public interface AddressService {
    AddressDTO addAddress(String email, AddressDTO addressDTO);
    AddressDTO updateAddress(String email, Long id, AddressDTO addressDTO);
    void deleteAddress(String email, Long id);
    List<AddressDTO> getAllAddresses(String email);
    AddressDTO getDefaultAddress(String email);
    void setDefaultAddress(String email, Long id);
}
