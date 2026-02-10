import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/enums';

/**
 * Redirects authenticated users to their role-specific portal.
 * Unauthenticated users are sent to the login page.
 */
export default function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case UserRole.PATIENT:
      return <Navigate to="/patient" replace />;
    case UserRole.DOCTOR:
      return <Navigate to="/doctor" replace />;
    case UserRole.HOSPITAL_ADMIN:
    case UserRole.SUPER_ADMIN:
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
