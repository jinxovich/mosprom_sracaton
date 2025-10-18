import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const [applications, setApplications] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Для представителей ВУЗов - загружаем их отклики
        if (user.role === 'university') {
          // В реальном проекте нужен эндпоинт /applications/my
          // Пока оставим пустым
          setApplications([]);
        }
        
        // Для HR - загружаем их вакансии
        if (user.role === 'hr') {
          const res = await api.get('/vacancies/my');
          setMyItems(res.data);
        }
        
        // Для ВУЗов - загружаем их стажировки
        if (user.role === 'university') {
          const res = await api.get('/internships/');
          // Фильтруем только свои (в реальности нужен отдельный эндпоинт)
          const myInternships = res.data.filter(item => item.owner_id === user.id);
          setMyItems(myInternships);
        }
        
      } catch (err) {
        console.error('Ошибка загрузки данных профиля:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <Alert severity="warning">
        Пожалуйста, войдите в систему для просмотра профиля
      </Alert>
    );
  }

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Администратор ОЭЗ',
      hr: 'Представитель компании (HR)',
      university: 'Представитель ВУЗа'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      hr: 'primary',
      university: 'secondary'
    };
    return colors[role] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Мой профиль
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              Профиль пользователя
            </Typography>
            
            <Chip 
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role)}
              sx={{ mt: 1 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText 
                  primary="Email"
                  secondary={user.email}
                />
              </ListItem>
              
              <ListItem>
                <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText 
                  primary="ID пользователя"
                  secondary={user.id}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {user.role === 'hr' && 'Мои вакансии'}
                {user.role === 'university' && 'Мои стажировки'}
                {user.role === 'admin' && 'Панель администратора'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {user.role === 'admin' && (
                <Alert severity="info">
                  Для управления контентом перейдите в раздел "Модерация"
                </Alert>
              )}
              
              {(user.role === 'hr' || user.role === 'university') && (
                <>
                  {myItems.length > 0 ? (
                    <List>
                      {myItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <ListItem>
                            <ListItemText
                              primary={item.title}
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.description || item.responsibilities || 'Без описания'}
                                  </Typography>
                                  <Chip 
                                    label={item.is_published ? 'Опубликовано' : 'На модерации'}
                                    size="small"
                                    color={item.is_published ? 'success' : 'warning'}
                                    sx={{ mt: 1 }}
                                  />
                                </>
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      {user.role === 'hr' 
                        ? 'У вас пока нет созданных вакансий'
                        : 'У вас пока нет созданных стажировок'}
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;