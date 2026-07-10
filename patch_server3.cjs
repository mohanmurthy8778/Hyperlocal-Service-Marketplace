const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/app\.use\('\/api\/customer\/\*', JWTMiddleware, RoleMiddleware\(\['customer'\]\)\);/, 
`app.get('/api/customer/bookings', JWTMiddleware, RoleMiddleware(['customer', 'admin']), (req, res) => {
  res.json(bookingsDb.filter(b => b.customerId === req.user.id));
});
app.use('/api/customer/*', JWTMiddleware, RoleMiddleware(['customer']));`);

fs.writeFileSync('server.ts', code);
