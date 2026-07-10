const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');

code = code.replace(/\s*\/\/ Simulate API call based on role\s*await new Promise\(resolve => setTimeout\(resolve, 800\)\);\s*/g, '\n      ');

fs.writeFileSync('src/pages/auth/Login.tsx', code);
