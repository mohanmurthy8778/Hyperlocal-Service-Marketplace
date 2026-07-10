const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(/const \[isDemoOpen, setIsDemoOpen\] = useState\(false\);\n/, '');

const demoSandboxRegex = /\{\/\* Quick Demo Switcher Panel \*\/\}(.|\n)*?<\/AnimatePresence>\s*<\/div>/;
code = code.replace(demoSandboxRegex, '');

fs.writeFileSync('src/components/Navbar.tsx', code);
