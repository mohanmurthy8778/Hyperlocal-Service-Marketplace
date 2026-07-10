const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const themeBtnRegex = /\s*<button\s+onClick=\{toggleTheme\}\s+className="p-2[^>]+>\s*\{theme === 'dark' \? <Sun className="h-4 w-4" \/> : <Moon className="h-4 w-4" \/>\}\s*<\/button>/g;
code = code.replace(themeBtnRegex, '');

fs.writeFileSync('src/components/Navbar.tsx', code);
