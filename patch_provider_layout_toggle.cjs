const fs = require('fs');
let code = fs.readFileSync('src/components/ProviderLayout.tsx', 'utf8');

const replacement = `
      <div className="mt-6 mb-4 px-3 border-t border-border-primary pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-text">Availability</span>
          <button
            onClick={() => {
               // Assuming setCurrentUser is available from useApp
               if (currentUser) {
                  // For a real app, you would make an API call to PUT /api/provider/availability
                  setCurrentUser({ ...currentUser, isOnline: !currentUser.isOnline });
               }
            }}
            className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none \${currentUser.isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}\`}
          >
            <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${currentUser.isOnline ? 'translate-x-6' : 'translate-x-1'}\`} />
          </button>
        </div>
        <p className="text-[10px] text-secondary-text mt-1.5">
          {currentUser.isOnline ? 'You are receiving new requests.' : 'You are currently offline.'}
        </p>
      </div>
      <button
`;

code = code.replace(/<button\s+onClick=\{handleLogout\}/, replacement.trim() + '\n      <button\n        onClick={handleLogout}');

if (!code.includes('setCurrentUser')) {
  code = code.replace(/const \{ logout, currentUser \} = useApp\(\);/, 'const { logout, currentUser, setCurrentUser } = useApp();');
}

fs.writeFileSync('src/components/ProviderLayout.tsx', code);
