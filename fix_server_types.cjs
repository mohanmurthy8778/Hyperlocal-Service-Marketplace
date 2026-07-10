const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const user = { ...req.user, role };",
  "const user = { ...(req as any).user, role };"
);

code = code.replace(
  "const user = jwt.verify(refreshToken, JWT_SECRET);",
  "const user = jwt.verify(refreshToken, JWT_SECRET) as any;"
);

fs.writeFileSync('server.ts', code);
