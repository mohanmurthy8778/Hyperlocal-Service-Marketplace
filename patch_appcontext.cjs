const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
`  const switchRole = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      toast(\`Switched workspace to \${currentUser.name} (\${role.toUpperCase()})\`, 'info');
    }
  };`,
`  const switchRole = async (role: UserRole) => {
    if (currentUser) {
      try {
        const res = await authApi.switchRole({ role });
        const token = res.accessToken || res.data?.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
          localStorage.setItem('token', token);
        }
        const updated = { ...currentUser, role };
        setCurrentUser(updated);
        toast(\`Switched workspace to \${currentUser.name} (\${role.toUpperCase()})\`, 'info');
      } catch (err) {
        toast(\`Failed to switch role\`, 'error');
        // fallback
        const updated = { ...currentUser, role };
        setCurrentUser(updated);
      }
    }
  };`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
