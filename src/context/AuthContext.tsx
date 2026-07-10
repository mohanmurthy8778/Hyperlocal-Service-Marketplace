// This file serves as an alias to AppContext for RBAC requirements.
import { useApp } from './AppContext';

export const useAuth = () => {
  const { currentUser, login, logout, register } = useApp();
  return { user: currentUser, login, logout, register, isAuthenticated: !!currentUser };
};
