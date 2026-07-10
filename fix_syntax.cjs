const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/res\.status\(404\)\.json\(\{ error: 'Not found' \}\);\s*\}\s*\);\s*\n\}\);/g, "res.status(404).json({ error: 'Not found' }); } });\n");

fs.writeFileSync('server.ts', code);
