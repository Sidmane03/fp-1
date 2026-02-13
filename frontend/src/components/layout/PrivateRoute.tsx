import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // 1. If still checking token, show nothing (or a spinner)
  if (loading) return <div className="p-4 text-center">Loading...</div>;

  // 2. If no user found, kick to Login
  if (!user) return <Navigate to="/login" replace />;

  // 3. If user exists, let them pass to the child route (Dashboard)
  return <Outlet />;
};

export default PrivateRoute;