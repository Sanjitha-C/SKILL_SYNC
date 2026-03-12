import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="page-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
