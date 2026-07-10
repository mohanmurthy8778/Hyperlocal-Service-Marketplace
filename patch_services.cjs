const fs = require('fs');
let code = fs.readFileSync('src/pages/Services.tsx', 'utf8');

code = code.replace(/const \{ services, users, language, toast \} = useApp\(\);/,
  "const { users, language, toast } = useApp();\n  const [providers, setProviders] = useState<any[]>([]);\n  const { customerApi } = require('../api/customerApi');");

fs.writeFileSync('src/pages/Services.tsx', code);
