import React, { useEffect, useState } from 'react';
import api from '../api';
import { Typography, CircularProgress, Box, Card, CardContent, CardActions, Button, Grid, Alert } from '@mui/material';

const AdminDashboardPage = () => {
  const [pending, setPending] = useState({ vacancies: [], internships: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vacanciesRes, internshipsRes] = await Promise.all([
        api.get('/moderation/vacancies/pending'),
        api.get('/moderation/internships/pending')
      ]);
      setPending({
        vacancies: vacanciesRes.data,
        internships: internshipsRes.data,
      });
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить данные для модерации.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePublish = async (type, id) => {
    try {
      await api.patch(`/moderation/${type}/${id}/publish`);
      alert('Успешно опубликовано!');
      fetchData();
    } catch (err) {
      alert('Ошибка при публикации.');
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
      <Typography variant="h4" component="h1" gutterBottom>Панель модерации</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {/* 
        ИСПРАВЛЕНО: 
        Применен новый синтаксис для Grid v5+, как и на главной странице.
        Свойства `item` нет, `xs` и `md` применяются напрямую.
      */}
      <Grid container spacing={4}>
        <Grid xs={12} md={6}>
          <Typography variant="h5" component="h2" gutterBottom>Вакансии на модерации</Typography>
          {pending.vacancies.length > 0 ? pending.vacancies.map(v => (
            <Card key={v.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{v.title}</Typography>
                <Typography variant="body2">{v.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handlePublish('vacancies', v.id)}>Опубликовать</Button>
              </CardActions>
            </Card>
          )) : <Typography>Нет вакансий на модерации.</Typography>}
        </Grid>
        
        <Grid xs={12} md={6}>
          <Typography variant="h5" component="h2" gutterBottom>Стажировки на модерации</Typography>
          {pending.internships.length > 0 ? pending.internships.map(i => (
            <Card key={i.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{i.title}</Typography>
                <Typography variant="body2">{i.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handlePublish('internships', i.id)}>Опубликовать</Button>
              </CardActions>
            </Card>
          )) : <Typography>Нет стажировок на модерации.</Typography>}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;