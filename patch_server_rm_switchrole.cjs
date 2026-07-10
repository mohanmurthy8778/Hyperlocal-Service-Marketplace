const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/api\/auth\/switch-role'[\s\S]*?res\.json\(\{ accessToken: token, user \}\);\n\}\);\n/;
code = code.replace(regex, '');

fs.writeFileSync('server.ts', code);
