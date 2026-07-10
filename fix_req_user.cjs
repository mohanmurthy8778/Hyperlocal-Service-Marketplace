const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "req.user = user;",
  "(req as any).user = user;"
);

code = code.replace(
  "if (req.user && roles.includes(req.user.role)) {",
  "if ((req as any).user && roles.includes((req as any).user.role)) {"
);

fs.writeFileSync('server.ts', code);
