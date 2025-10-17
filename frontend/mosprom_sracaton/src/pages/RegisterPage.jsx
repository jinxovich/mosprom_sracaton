import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { TextField, Button, Container, Box, Typography, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const RegisterPage = () => {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const role = watch("role", "hr"); // По умолчанию 'hr'

  const onSubmit = async (data) => {
    try {
      setError(null);
      await api.post('/users/', data); // Данные отправляются как JSON
      setSuccess('Вы успешно зарегистрированы! Теперь вы можете войти.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError("Ошибка регистрации. Возможно, пользователь с таким email уже существует.");
      console.error("Ошибка регистрации:", err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Регистрация</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
          
          <TextField margin="normal" required fullWidth id="email" label="Email" {...register('email')} />
          <TextField margin="normal" required fullWidth label="Пароль" type="password" id="password" {...register('password')} />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Роль</InputLabel>
            <Select
              labelId="role-select-label"
              id="role"
              value={role}
              label="Роль"
              {...register('role')}
            >
              <MenuItem value="hr">Представитель компании (HR)</MenuItem>
              <MenuItem value="university">Представитель ВУЗа</MenuItem>
              {/* Админа можно зарегистрировать только через БД или отдельный скрипт */}
            </Select>
          </FormControl>
          
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Зарегистрироваться</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;