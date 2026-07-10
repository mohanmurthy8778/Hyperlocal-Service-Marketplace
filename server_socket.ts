import { Server } from 'socket.io';

const users = new Map<string, { socketId: string, role: string, data?: any }>();

export function setupSocket(io: Server, bookingsDb: any[], providersDb: any[]) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('register', (data) => {
      users.set(data.userId, { socketId: socket.id, role: data.role, data: data.userData });
      console.log(`User registered: ${data.userId} as ${data.role}`);
      if (data.role === 'provider') {
        socket.join('providers');
      }
    });

    socket.on('get_booking', (data) => {
       const b = bookingsDb.find(x => x.id === data.bookingId || x.bookingId === data.bookingId || x.booking_id === data.bookingId);
       if (b) {
         socket.emit('booking_data', b);
       }
    });

    socket.on('request_booking', (bookingReq) => {
      console.log('Booking request:', bookingReq);
      const bookingId = 'BKG-' + Date.now();
      const newBooking = {
        id: bookingId,
        booking_id: bookingId,
        bookingId: bookingId,
        customerId: bookingReq.customerId,
        customer_id: bookingReq.customerId,
        customerName: bookingReq.customerName,
        customer_name: bookingReq.customerName,
        customerPhone: bookingReq.customerPhone,
        customer_phone: bookingReq.customerPhone,
        serviceId: bookingReq.serviceId,
        service_id: bookingReq.serviceId,
        serviceTitle: bookingReq.serviceTitle,
        service_name: bookingReq.serviceTitle,
        categoryName: bookingReq.categoryName,
        service_category: bookingReq.categoryName,
        address: bookingReq.address,
        service_address: bookingReq.address,
        latitude: bookingReq.latitude || 12.9716,
        longitude: bookingReq.longitude || 77.5946,
        totalPrice: bookingReq.totalPrice,
        estimated_price: bookingReq.totalPrice,
        status: 'searching',
        paymentStatus: 'pending',
        payment_status: 'pending',
        notes: bookingReq.notes || '',
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rejectedBy: [],
        providerId: null,
        provider_id: null
      };

      bookingsDb.push(newBooking);

      const customerSocket = users.get(bookingReq.customerId)?.socketId;
      if (customerSocket) {
        io.to(customerSocket).emit('booking_status_updated', newBooking);
      }

      io.to('providers').emit('incoming_booking', newBooking);
      io.emit('booking_created', newBooking); // Emit globally for booking history syncing
      
      setTimeout(() => {
        const b = bookingsDb.find(x => x.id === bookingId);
        if (b && b.status === 'searching') {
          b.status = 'no_provider_found';
          if (customerSocket) {
            io.to(customerSocket).emit('booking_status_updated', b);
          }
          io.to('providers').emit('cancel_incoming_booking', { id: bookingId });
        }
      }, 60000);
    });

    socket.on('accept_booking', (data) => {
      const b = bookingsDb.find(x => x.id === data.bookingId || x.bookingId === data.bookingId || x.booking_id === data.bookingId);
      if (b && (b.status === 'searching' || b.status === 'pending' || b.status === 'PENDING')) {
        b.status = 'accepted';
        b.providerId = data.providerId;
        b.provider_id = data.providerId;
        const providerData = users.get(data.providerId)?.data || providersDb.find(p => p.id === data.providerId);
        b.providerName = providerData?.fullName || providerData?.name || 'Provider';
        b.provider_name = providerData?.fullName || providerData?.name || 'Provider';
        b.providerAvatar = providerData?.profileImage || providerData?.avatar || '';
        b.provider_avatar = providerData?.profileImage || providerData?.avatar || '';
        b.providerPhone = providerData?.phone || '';
        b.provider_phone = providerData?.phone || '';
        b.accepted_at = new Date().toISOString();
        b.provider_current_location = { latitude: 12.9716, longitude: 77.5946 };
        b.estimated_arrival_time = '15 mins';
        b.updated_at = new Date().toISOString();
        
        io.to('providers').emit('cancel_incoming_booking', { id: b.id });

        const customerSocket = users.get(b.customerId)?.socketId;
        if (customerSocket) {
          io.to(customerSocket).emit('booking_status_updated', b);
          io.to(customerSocket).emit('booking_accepted', b);
        }
        
        socket.emit('booking_accepted_success', b);
        io.emit('booking_status_updated', b); // Global sync
      } else {
        socket.emit('booking_already_taken', { id: data.bookingId });
      }
    });

    socket.on('reject_booking', (data) => {
      const b = bookingsDb.find(x => x.id === data.bookingId || x.bookingId === data.bookingId || x.booking_id === data.bookingId);
      if (b) {
        if (b.status === 'searching') {
          if (!b.rejectedBy) b.rejectedBy = [];
          b.rejectedBy.push(data.providerId);
        } else if (b.status === 'pending' || b.status === 'PENDING') {
          b.status = 'rejected';
          b.rejection_reason = data.reason || 'Decline request';
          b.updated_at = new Date().toISOString();
          
          const customerSocket = users.get(b.customerId)?.socketId;
          if (customerSocket) {
            io.to(customerSocket).emit('booking_status_updated', b);
            io.to(customerSocket).emit('booking_rejected', b);
          }
          io.emit('booking_status_updated', b);
        }
      }
    });

    socket.on('update_location', (data) => {
      const b = bookingsDb.find(x => x.id === data.bookingId || x.bookingId === data.bookingId || x.booking_id === data.bookingId);
      if (b) {
        b.provider_current_location = { latitude: data.latitude, longitude: data.longitude };
        const customerSocket = users.get(b.customerId)?.socketId;
        if (customerSocket) {
          io.to(customerSocket).emit('location_updated', data);
        }
      }
    });

    socket.on('update_booking_status', (data) => {
      const b = bookingsDb.find(x => x.id === data.bookingId || x.bookingId === data.bookingId || x.booking_id === data.bookingId);
      if (b) {
        b.status = data.status;
        b.updated_at = new Date().toISOString();
        if (data.status === 'completed') {
          b.paymentStatus = 'paid';
          b.payment_status = 'paid';
        }
        
        const customerSocket = users.get(b.customerId)?.socketId;
        if (customerSocket) {
          io.to(customerSocket).emit('booking_status_updated', b);
          if (data.status === 'started') {
            io.to(customerSocket).emit('booking_started', b);
          } else if (data.status === 'completed') {
            io.to(customerSocket).emit('booking_completed', b);
          }
        }
        const providerSocket = b.providerId ? users.get(b.providerId)?.socketId : null;
        if (providerSocket) {
          io.to(providerSocket).emit('booking_status_updated', b);
        }
        io.emit('booking_status_updated', b); // Global sync
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      for (const [userId, user] of users.entries()) {
        if (user.socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
    });
  });
}
