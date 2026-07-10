const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const providerApis = `
// --- Provider APIs ---
app.get('/api/provider/dashboard', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({
    totalRequests: 5,
    pendingRequests: 2,
    acceptedJobs: 3,
    completedJobs: 15,
    todayEarnings: 2500,
    weeklyEarnings: 15000,
    monthlyEarnings: 45000,
    rating: 4.8,
    isOnline: true
  });
});

app.get('/api/provider/requests', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/bookings', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.post('/api/provider/request/:id/accept', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, message: 'Request accepted' });
});

app.post('/api/provider/request/:id/reject', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, message: 'Request rejected' });
});

app.get('/api/provider/ongoing', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/completed', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/earnings', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({
    today: 2500,
    weekly: 15000,
    monthly: 45000,
    total: 120000,
    history: []
  });
});

app.put('/api/provider/profile', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, message: 'Profile updated' });
});

app.put('/api/provider/location', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, message: 'Location updated' });
});

app.put('/api/provider/availability', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, isOnline: req.body.isOnline });
});

app.get('/api/provider/notifications', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/reviews', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});
`;

code = code.replace(/app\.use\('\/api\/\*',/, providerApis + '\napp.use(\'/api/*\',');

fs.writeFileSync('server.ts', code);
