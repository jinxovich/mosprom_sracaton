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
  CircularProgress,
  Stack,
  Link,
  Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';

// НОВЫЙ КОМПОНЕНТ для отображения деталей отклика (анкета или файл)
const ApplicationDetails = ({ application }) => {
  // Базовый URL вашего бэкенда для построения ссылок на файлы
  const API_BASE_URL = 'http://localhost:8000'; 

  // Пытаемся распарсить данные анкеты, если они есть
  let resumeData = null;
  if (application.resume_data) {
    try {
      // resume_data из БД приходит как строка, ее нужно преобразовать в объект
      resumeData = typeof application.resume_data === 'string' 
        ? JSON.parse(application.resume_data) 
        : application.resume_data;
    } catch (e) {
      console.error("Ошибка парсинга JSON в resume_data:", e);
    }
  }

  return (
    <Box sx={{ mt: 1, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
      {application.resume_file_path && (
        <Button 
          variant="outlined" 
          startIcon={<DescriptionIcon />} 
          href={`${API_BASE_URL}/${application.resume_file_path}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Скачать резюме (файл)
        </Button>
      )}

      {resumeData && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>Данные из анкеты:</Typography>
          <List dense>
            {Object.entries(resumeData).map(([key, value]) => (
              <ListItem key={key} sx={{ p: 0 }}>
                <ListItemText
                  primary={<strong>{key}:</strong>}
                  secondary={value}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};


const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const [myVacancies, setMyVacancies] = useState([]);
  
  // ИЗМЕНЕНИЕ: Переименовали state для ясности
  const [myApplications, setMyApplications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // ИЗМЕНЕНИЕ: Логика загрузки данных для HR
        if (user.role === 'hr') {
          // Выполняем запросы параллельно для скорости
          const [vacanciesRes, applicationsRes] = await Promise.all([
            api.get('/vacancies/my'),
            api.get('/applications/my-vacancy-applications') // Эндпоинт для получения откликов
          ]);
          setMyVacancies(vacanciesRes.data);
          setMyApplications(applicationsRes.data);
        }
        
        // Для ВУЗов - загружаем их стажировки
        if (user.role === 'university') {
          const res = await api.get('/internships/my'); // Предполагаем, что есть эндпоинт /my
          setMyVacancies(res.data); // Можно использовать тот же state
        }
        
      } catch (err) {
        setError('Не удалось загрузить данные профиля. Попробуйте обновить страницу.');
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
        Пожалуйста, войдите в систему для просмотра профиля.
      </Alert>
    );
  }

  // Функции getRoleLabel и getRoleColor без изменений
  const getRoleLabel = (role) => ({
    admin: 'Администратор ОЭЗ', hr: 'Представитель компании (HR)', university: 'Представитель ВУЗа'
  })[role] || role;

  const getRoleColor = (role) => ({
    admin: 'error', hr: 'primary', university: 'secondary'
  })[role] || 'default';

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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Левая колонка с информацией о пользователе (без изменений) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}>
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              Профиль пользователя
            </Typography>
            <Chip label={getRoleLabel(user.role)} color={getRoleColor(user.role)} sx={{ mt: 1 }} />
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>
              <ListItem>
                <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText primary="ID пользователя" secondary={user.id} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Правая колонка с контентом */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* Блок с вакансиями или стажировками */}
            {(user.role === 'hr' || user.role === 'university') && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {user.role === 'hr' ? 'Мои вакансии' : 'Мои стажировки'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {myVacancies.length > 0 ? (
                    <List>
                      {myVacancies.map((item) => (
                        <ListItem key={item.id} divider>
                          <ListItemText
                            primary={item.title}
                            secondary={`Статус: ${item.is_published ? 'Опубликовано' : 'На модерации'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      {user.role === 'hr' ? 'У вас пока нет созданных вакансий' : 'У вас пока нет созданных стажировок'}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* НОВЫЙ БЛОК: Отклики для HR */}
            {user.role === 'hr' && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Отклики на ваши вакансии
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {myApplications.length > 0 ? (
                    <List>
                      {myApplications.map((app) => (
                        <ListItem key={app.id} divider alignItems="flex-start">
                          <ListItemText
                            primary={`Отклик на вакансию ID: ${app.vacancy_id}`}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  Получено: {new Date(app.created_at).toLocaleString('ru-RU')}
                                </Typography>
                                <ApplicationDetails application={app} />
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Новых откликов пока нет.</Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {user.role === 'admin' && (
              <Alert severity="info">
                Для управления контентом перейдите в раздел "Модерация"
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;