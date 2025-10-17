import React from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const Layout = () => {
  // ИСПРАВЛЕНО: Получаем `token` и `user` через реактивные хуки.
  // Теперь, когда они изменятся после логина, компонент автоматически перерисуется.
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // ИСПРАВЛЕНО: Вычисляем флаг аутентификации прямо здесь.
  // Если токен есть - пользователь залогинен.
  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Технополис.Карьера
          </Typography>
          
          <Box>
            <Button color="inherit" component={RouterLink} to="/">Главная</Button>
            
            {isAuthenticated ? (
              <>
                {/* ЭТА ЛОГИКА ТЕПЕРЬ СРАБОТАЕТ ПРАВИЛЬНО */}
                {user?.role === 'hr' && <Button color="inherit" component={RouterLink} to="/create-vacancy">Создать вакансию</Button>}
                {user?.role === 'university' && <Button color="inherit" component={RouterLink} to="/create-internship">Создать стажировку</Button>}
                {user?.role === 'admin' && <Button color="inherit" component={RouterLink} to="/admin-dashboard">Модерация</Button>}
                
                <Button color="inherit" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">Войти</Button>
                <Button color="inherit" component={RouterLink} to="/register">Регистрация</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © Хакатон Технополис {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;