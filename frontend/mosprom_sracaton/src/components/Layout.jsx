import React from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Layout = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Технополис.Карьера
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/">Главная</Button>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'hr' && <Button color="inherit" component={RouterLink} to="/create-vacancy">Создать вакансию</Button>}
                {user?.role === 'university' && <Button color="inherit" component={RouterLink} to="/create-internship">Создать стажировку</Button>}
                {user?.role === 'admin' && <Button color="inherit" component={RouterLink} to="/admin-dashboard">Модерация</Button>}
                
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <AccountCircleIcon />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleProfileClick}>Профиль</MenuItem>
                  <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                </Menu>
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