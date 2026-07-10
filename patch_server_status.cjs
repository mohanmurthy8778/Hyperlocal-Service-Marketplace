const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
app.patch('/api/bookings/:id/status', JWTMiddleware, (req, res) => {
  const { status } = req.query;
  const booking = bookingsDb.find(b => b.bookingId === req.params.id || b.id === req.params.id);
  if (booking) {
    booking.status = (status || '').toUpperCase();
    io.emit('booking_status_update', booking);
    res.json({ success: true, booking });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
`;

code = code.replace(/app\.use\('\/api\/customer\/\*', JWTMiddleware, RoleMiddleware\(\['customer'\]\)\);/, 
newRoute + "\napp.use('/api/customer/*', JWTMiddleware, RoleMiddleware(['customer']));");

fs.writeFileSync('server.ts', code);
