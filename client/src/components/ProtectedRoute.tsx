// client/src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './useUser';

export function ProtectedRoute() {
  const { user } = useUser();

  if (!user) return <Navigate to="/auth/sign-in" replace />;

  return <Outlet />;
}
