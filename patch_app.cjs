const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { ProviderLayout }')) {
  code = code.replace(/import { ProviderDashboard }/, 'import { ProviderLayout } from \'./components/ProviderLayout\';\nimport { ProviderDashboard }');
}

const oldProviderRoutesRegex = /\{\/\* Provider Routes \*\/\}[\s\S]*?(?=\{\/\* Admin Routes \*\/)/;

const newProviderRoutes = `{/* Provider Routes */}
              <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<ProviderDashboard />} />
                <Route path="requests" element={<ProviderLiveBookings />} />
                <Route path="ongoing-jobs" element={<ManageBookings />} />
                <Route path="completed-jobs" element={<ProviderHistory />} />
                <Route path="live-tracking" element={<ProviderTracking />} />
                <Route path="earnings" element={<EarningsDashboard />} />
                <Route path="profile" element={<EditProfile />} />
                <Route path="settings" element={<ProviderSettings />} />
                <Route path="notifications" element={<ProviderNotifications />} />
                <Route path="calendar" element={<AvailabilityCalendar />} />
                <Route path="add-service" element={<AddEditService />} />
              </Route>
              `;

code = code.replace(oldProviderRoutesRegex, newProviderRoutes);

fs.writeFileSync('src/App.tsx', code);
