// src/App.jsx

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
import ApplyPage from './pages/ApplyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* ИСПРАВЛЕНО: Маршрут для отклика находится здесь, внутри основного Layout */}
        <Route
          path="apply/:type/:id"
          element={
            <ProtectedRoute roles={['applicant']}>
              <ApplyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="create-vacancy"
          element={
            <ProtectedRoute roles={['hr']}>
              <CreateVacancyPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="create-internship"
          element={
            <ProtectedRoute roles={['university']}>
              <CreateInternshipPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="admin-dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ИСПРАВЛЕНО: Дублирующийся маршрут отсюда удален */}
    </Routes>
  );
}

export default App;