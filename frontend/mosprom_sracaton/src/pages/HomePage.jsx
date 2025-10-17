import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';
import { Typography, CircularProgress, Box, Card, CardContent, CardActions, Button, Grid, Alert } from '@mui/material';

const HomePage = () => {
  const [items, setItems] = useState({ vacancies: [], internships: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [vacanciesRes, internshipsRes] = await Promise.all([
          api.get('/vacancies/'),
          api.get('/internships/')
        ]);
        setItems({
          vacancies: vacanciesRes.data,
          internships: internshipsRes.data,
        });
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить данные. Проверьте, запущен ли бэкенд-сервер и настроен ли CORS.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleApply = async (type, id) => {
    if (!user) {
        alert('Для отклика необходимо войти в систему.');
        return;
    }
    try {
      await api.post(`/applications/${type}/${id}`);
      alert('Вы успешно откликнулись!');
    } catch (err) {
      alert('Ошибка при отклике. Возможно, вы уже откликались или у вас нет прав.');
      console.error(err);
    }
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
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {/* 
        ИСПРАВЛЕНО: 
        1. Убрано свойство `item` у дочерних Grid-элементов.
        2. Свойства `xs={12}` и `md={6}` теперь применяются напрямую к Grid.
        Это новый синтаксис для Material-UI Grid v5+.
      */}
      <Grid container spacing={4}>
        <Grid xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>Вакансии</Typography>
          {items.vacancies.length > 0 ? items.vacancies.map(v => (
            <Card key={v.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5">{v.title}</Typography>
                <Typography variant="body2">{v.description}</Typography>
              </CardContent>
              {user?.role === 'university' && (
                <CardActions>
                  <Button size="small" onClick={() => handleApply('vacancy', v.id)}>Откликнуться</Button>
                </CardActions>
              )}
            </Card>
          )) : <Typography>Опубликованных вакансий нет.</Typography>}
        </Grid>
        
        <Grid xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>Стажировки</Typography>
          {items.internships.length > 0 ? items.internships.map(i => (
            <Card key={i.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5">{i.title}</Typography>
                <Typography variant="body2">{i.description}</Typography>
              </CardContent>
              {user?.role === 'university' && (
                <CardActions>
                  <Button size="small" onClick={() => handleApply('internship', i.id)}>Откликнуться</Button>
                </CardActions>
              )}
            </Card>
          )) : <Typography>Опубликованных стажировок нет.</Typography>}
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;