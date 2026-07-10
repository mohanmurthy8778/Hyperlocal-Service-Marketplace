const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Register.tsx', 'utf8');

code = code.replace(/\s*await new Promise\(resolve => setTimeout\(resolve, 800\)\);\s*/g, '\n      ');

fs.writeFileSync('src/pages/auth/Register.tsx', code);
