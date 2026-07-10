package com.servicehub.booking.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.servicehub.booking.dto.LocationDTO;
import com.servicehub.booking.dto.BookingStatusDTO;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class BookingWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/provider/location")
    public void updateLocation(@Payload LocationDTO locationDTO) {
        // Broadcast location to the specific booking topic
        messagingTemplate.convertAndSend("/topic/location/" + locationDTO.getBookingId(), locationDTO);
    }

    @MessageMapping("/booking/status")
    public void updateBookingStatus(@Payload BookingStatusDTO statusDTO) {
        messagingTemplate.convertAndSend("/topic/booking/" + statusDTO.getBookingId(), statusDTO);
    }
}
