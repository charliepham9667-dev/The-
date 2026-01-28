import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Protects routes based on user role.
 * Redirects to fallbackPath if user doesn't have required role.
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/' 
}: RoleGuardProps) {
  const profile = useAuthStore((s) => s.profile);
  const hasRole = useAuthStore((s) => s.hasRole);

  // If profile not loaded yet, show nothing (parent ProtectedRoute handles auth)
  if (!profile) {
    return null;
  }

  // Check if user has one of the allowed roles
  if (!hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

/**
 * Only allows owners
 */
export function OwnerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['owner']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Allows managers and owners
 */
export function ManagerOrOwner({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['owner', 'manager']}>
      {children}
    </RoleGuard>
  );
}

/**
 * Allows all authenticated users (staff, manager, owner)
 */
export function AnyRole({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['owner', 'manager', 'staff']}>
      {children}
    </RoleGuard>
  );
}
