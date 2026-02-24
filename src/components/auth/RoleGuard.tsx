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
 * Note: Owners always have access regardless of viewAs mode (viewAs is UI-only).
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/' 
}: RoleGuardProps) {
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);

  // If profile not loaded yet and auth is initialized, fetchProfile likely failed — redirect to login
  if (!profile && initialized) {
    return <Navigate to="/login" replace />;
  }
  // Still loading (initialized false) — show nothing; ProtectedRoute shows loading
  if (!profile) {
    return null;
  }

  // Owners always have full access (viewAs is just for UI preview)
  const actualRole = profile.role;
  if (actualRole === 'owner') {
    return <>{children}</>;
  }

  // Investors have read-only access to owner routes (treated as owner for route access)
  if (actualRole === 'investor' && allowedRoles.includes('owner')) {
    return <>{children}</>;
  }

  // For non-owners, check against allowed roles
  if (!allowedRoles.includes(actualRole)) {
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
