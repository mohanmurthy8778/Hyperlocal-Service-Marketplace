const fs = require('fs');
let code = fs.readFileSync('src/components/ProviderLocationTracker.tsx', 'utf8');

code = code.replace(/import \{ useSocket \} from '\.\.\/hooks\/useSocket';/, 
  "import { useSocket } from '../hooks/useSocket';\nimport axiosInstance from '../api/axios';");

code = code.replace(/socket\.emit\('update_location', \{/, 
  "axiosInstance.post(`/bookings/${bookingId}/location`, { latitude, longitude }).catch(console.error);\n              socket.emit('update_location', {");

fs.writeFileSync('src/components/ProviderLocationTracker.tsx', code);
