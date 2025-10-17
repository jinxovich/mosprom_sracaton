import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, roles }) => {
  // ИСПРАВЛЕНО: Получаем `token` и `user` реактивно.
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  // ИСПРАВЛЕНО: Вычисляем аутентификацию на основе наличия токена.
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userHasRequiredRole = roles ? roles.includes(user?.role) : true;
  if (!userHasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;