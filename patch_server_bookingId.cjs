const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/bookingId: 'bk_' \+ Date\.now\(\)/g, "id: 'bk_' + Date.now(), bookingId: 'bk_' + Date.now()");

fs.writeFileSync('server.ts', code);
