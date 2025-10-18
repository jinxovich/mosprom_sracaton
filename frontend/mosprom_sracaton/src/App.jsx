import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Импорт компонентов
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Импорт страниц
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateVacancyPage from './pages/CreateVacancyPage';
import CreateInternshipPage from './pages/CreateInternshipPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      {/* Все страницы будут обернуты в Layout с шапкой и подвалом */}
      <Route path="/" element={<Layout />}>
        {/* --- Публичные роуты --- */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* --- Защищенные роуты --- */}
        
        {/* Профиль - доступен всем авторизованным */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* Доступ только для HR */}
        <Route
          path="create-vacancy"
          element={
            <ProtectedRoute roles={['hr']}>
              <CreateVacancyPage />
            </ProtectedRoute>
          }
        />
        
        {/* Доступ только для ВУЗов */}
        <Route
          path="create-internship"
          element={
            <ProtectedRoute roles={['university']}>
              <CreateInternshipPage />
            </ProtectedRoute>
          }
        />
        
        {/* Доступ только для Админов */}
        <Route
          path="admin-dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;