import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Box, Typography, Paper, Avatar } from '@mui/material';

const ProfilePage = () => {
  // Получаем данные пользователя прямо из стора
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Typography>Загрузка данных профиля...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
          {/* Первая буква имени пользователя */}
          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Typography variant="h4" component="h1" gutterBottom>
          Профиль пользователя
        </Typography>
        <Typography variant="h6" component="p">
          Email: {user.email}
        </Typography>
        <Typography variant="body1" color="text.secondary" component="p">
          Роль: {user.role}
        </Typography>
        <Typography variant="body1" color="text.secondary" component="p">
          ID пользователя: {user.id}
        </Typography>
        {/* Сюда можно добавить другую информацию из профиля */}
      </Box>
    </Paper>
  );
};

export default ProfilePage;