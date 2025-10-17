import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
      // API ожидает form-urlencoded, создаем его
      const params = new URLSearchParams();
      params.append('username', data.email);
      params.append('password', data.password);
      
      const response = await api.post('/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const { access_token } = response.data;
      
      // Декодируем токен, чтобы получить данные пользователя (роль)
      const decodedUser = jwtDecode(access_token);
      
      // Сохраняем токен и данные пользователя в стор
      // `decodedUser.sub` - это email в стандартном JWT
      loginAction(access_token, { email: decodedUser.sub, role: decodedUser.role });
      
      navigate('/');
    } catch (err) {
      setError("Неверный email или пароль.");
      console.error("Ошибка входа:", err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Вход</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField margin="normal" required fullWidth id="email" label="Email" {...register('email')} />
          <TextField margin="normal" required fullWidth label="Пароль" type="password" id="password" {...register('password')} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Войти</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;