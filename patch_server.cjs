const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const additionalApis = `
let providersDb = [];
let bookingsDb = [];

function seedProviders() {
  if (providersDb.length === 0) {
    const categories = [
      'cleaning', 'repairs', 'salon', 'tutoring', 'painting', 'lawn'
    ];
    const roles = [
      'Home Cleaner', 'Electrician', 'Salon Expert', 'Tutor', 'Painter', 'Gardener', 'Plumber', 'Carpenter', 'AC Technician', 'Mechanic'
    ];
    for (let i = 0; i < 10; i++) {
      providersDb.push({
        id: 'prov_' + (i + 1),
        fullName: \`Demo \${roles[i]}\`,
        email: \`demo\${i}@provider.com\`,
        phone: '+91987654321' + i,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        serviceCategory: categories[i % categories.length],
        experience: (i % 5) + 2 + ' Years',
        rating: 4.0 + (i % 10) / 10,
        address: '123 Tech Park, Bangalore',
        latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
        longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
        availability: i % 3 === 0 ? 'OFFLINE' : 'ONLINE',
        verified: true,
        price: 300 + i * 50,
        description: \`Expert \${roles[i]} with great skills.\`,
        role: 'PROVIDER'
      });
    }
  }
}
seedProviders();

app.get('/api/providers', (req, res) => {
  res.json(providersDb);
});

app.get('/api/providers/category/:category', (req, res) => {
  const { category } = req.params;
  const filtered = category === 'all' ? providersDb : providersDb.filter(p => p.serviceCategory === category);
  res.json(filtered);
});

app.get('/api/providers/servicehub', (req, res) => {
  res.json(providersDb.filter(p => p.availability === 'ONLINE'));
});

app.post('/api/bookings', JWTMiddleware, (req, res) => {
  const newBooking = {
    ...req.body,
    bookingId: 'bk_' + Date.now(),
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  bookingsDb.push(newBooking);
  io.emit('new_booking_request', newBooking); // Emit to providers
  res.json(newBooking);
});

app.get('/api/bookings/provider/:id', JWTMiddleware, (req, res) => {
  res.json(bookingsDb.filter(b => b.providerId === req.params.id));
});

app.get('/api/bookings/customer/:id', JWTMiddleware, (req, res) => {
  res.json(bookingsDb.filter(b => b.customerId === req.params.id));
});

app.patch('/api/bookings/:id/accept', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => b.bookingId === req.params.id);
  if (booking) {
    booking.status = 'ACCEPTED';
    io.emit('booking_status_update', booking);
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.patch('/api/bookings/:id/reject', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => b.bookingId === req.params.id);
  if (booking) {
    booking.status = 'REJECTED';
    io.emit('booking_status_update', booking);
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.patch('/api/providers/location', JWTMiddleware, (req, res) => {
  const { id, latitude, longitude } = req.body;
  const p = providersDb.find(x => x.id === id);
  if (p) {
    p.latitude = latitude;
    p.longitude = longitude;
    io.emit('provider_location_update', { id, latitude, longitude });
    res.json(p);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
`;

code = code.replace(/app\.use\('\/api\/\*',/, additionalApis + '\napp.use(\'/api/*\',');

fs.writeFileSync('server.ts', code);
