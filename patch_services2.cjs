const fs = require('fs');
let code = fs.readFileSync('src/pages/Services.tsx', 'utf8');

code = code.replace(/import \{ useTranslation \} from '\.\.\/utils\/translations';/, 
  "import { useTranslation } from '../utils/translations';\nimport { customerApi } from '../api/customerApi';\nimport { ProviderBookingModal } from '../components/ProviderBookingModal';\nimport { ProviderCard } from '../components/ProviderCard';");

code = code.replace(/const \{ users, language, toast \} = useApp\(\);/,
  "const { currentUser, language, toast } = useApp();");

code = code.replace(/const \[providers, setProviders\] = useState<any\[\]>\(\[\]\);\n\s*const \{ customerApi \} = require\('\.\.\/api\/customerApi'\);/,
  "const [providers, setProviders] = useState<any[]>([]);\n  const [bookingProvider, setBookingProvider] = useState<any | null>(null);");

fs.writeFileSync('src/pages/Services.tsx', code);
