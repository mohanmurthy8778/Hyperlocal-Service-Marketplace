const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import { ProviderLiveBookings } from '.\/pages\/provider\/ProviderLiveBookings';/, "import { ProviderRequests } from './pages/provider/ProviderRequests';\nimport { ProviderOngoingJobs } from './pages/provider/ProviderOngoingJobs';\nimport { ProviderCompletedJobs } from './pages/provider/ProviderCompletedJobs';");

code = code.replace(/element=\{<ProviderLiveBookings \/>\}/, 'element={<ProviderRequests />}');
code = code.replace(/element=\{<ManageBookings \/>\}/, 'element={<ProviderOngoingJobs />}');
code = code.replace(/element=\{<ProviderHistory \/>\}/, 'element={<ProviderCompletedJobs />}');

fs.writeFileSync('src/App.tsx', code);
