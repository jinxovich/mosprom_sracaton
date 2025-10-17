import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { TextField, Button, Container, Box, Typography, Alert } from '@mui/material';

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setError(null);
      
      // API ожидает form-urlencoded
      const params = new URLSearchParams();
      params.append('username', data.email);
      params.append('password', data.password);
      
      const response = await api.post('/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const { access_token, user } = response.data;
      
      // Сохраняем токен и данные пользователя
      loginAction(access_token, user);
      
      // Перенаправляем в зависимости от роли
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'hr') {
        navigate('/create-vacancy');
      } else if (user.role === 'university') {
        navigate('/create-internship');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError("Неверный email или пароль.");
      console.error("Ошибка входа:", err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Вход в систему</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            id="email" 
            label="Email адрес" 
            autoComplete="email"
            autoFocus
            {...register('email')} 
          />
          
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            label="Пароль" 
            type="password" 
            id="password"
            autoComplete="current-password"
            {...register('password')} 
          />
          
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;