const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const refreshEndpoint = `
app.post('/api/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  // Dummy verify
  try {
    const user = jwt.verify(refreshToken, JWT_SECRET);
    const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ accessToken: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
`;

code = code.replace("app.post('/api/auth/login', (req, res) => {", refreshEndpoint + "\napp.post('/api/auth/login', (req, res) => {");
fs.writeFileSync('server.ts', code);
