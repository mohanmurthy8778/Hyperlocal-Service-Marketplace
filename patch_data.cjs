const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const regex = /export const MOCK_USERS: User\[\] = \[(.|\n)*$/;
code = code.replace(regex, '');

fs.writeFileSync('src/data.ts', code);
