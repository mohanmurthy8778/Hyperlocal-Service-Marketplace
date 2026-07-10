const fs = require('fs');
let code = fs.readFileSync('src/api/authApi.ts', 'utf8');

const regex = /\n\s*switchRole: async \([^}]+\} \=\> \{[^}]+\}[^}]+\}[^}]+\},/;
code = code.replace(regex, '');

fs.writeFileSync('src/api/authApi.ts', code);
