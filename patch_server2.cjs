const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/app\.get\('\/api\/provider\/bookings',\s*JWTMiddleware,\s*RoleMiddleware\(\['provider'\]\),\s*\(req,\s*res\)\s*=>\s*\{\s*res\.json\(\[\]\);\s*\}\);/,
  "app.get('/api/provider/bookings', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { res.json(bookingsDb.filter(b => b.providerId === req.user.id)); });");

code = code.replace(/app\.get\('\/api\/provider\/requests',\s*JWTMiddleware,\s*RoleMiddleware\(\['provider'\]\),\s*\(req,\s*res\)\s*=>\s*\{\s*res\.json\(\[\]\);\s*\}\);/,
  "app.get('/api/provider/requests', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { res.json(bookingsDb.filter(b => b.providerId === req.user.id && b.status === 'PENDING')); });");

code = code.replace(/app\.post\('\/api\/provider\/request\/:id\/accept',\s*JWTMiddleware,\s*RoleMiddleware\(\['provider'\]\),\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/,
  "app.post('/api/provider/request/:id/accept', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { const booking = bookingsDb.find(b => b.bookingId === req.params.id || b.id === req.params.id); if (booking) { booking.status = 'ACCEPTED'; io.emit('booking_status_update', booking); res.json({ success: true, booking }); } else { res.status(404).json({ error: 'Not found' }); } });");

code = code.replace(/app\.post\('\/api\/provider\/request\/:id\/reject',\s*JWTMiddleware,\s*RoleMiddleware\(\['provider'\]\),\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/,
  "app.post('/api/provider/request/:id/reject', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { const booking = bookingsDb.find(b => b.bookingId === req.params.id || b.id === req.params.id); if (booking) { booking.status = 'REJECTED'; io.emit('booking_status_update', booking); res.json({ success: true, booking }); } else { res.status(404).json({ error: 'Not found' }); } });");

fs.writeFileSync('server.ts', code);
