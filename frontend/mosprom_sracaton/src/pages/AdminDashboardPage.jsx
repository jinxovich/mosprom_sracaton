import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Alert,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

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
      fetchData(); // Перезагружаем данные после успешной публикации
    } catch (err) {
      alert('Ошибка при публикации.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalPending = pending.vacancies.length + pending.internships.length;

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        Панель модерации
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Chip
          icon={<PendingIcon />}
          label={`Всего на модерации: ${totalPending}`}
          color="warning"
          size="medium"
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Блок для вакансий */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Вакансии на модерации
            </Typography>
            <Divider />
          </Box>

          {pending.vacancies.length > 0 ? (
            <Stack spacing={2}>
              {pending.vacancies.map(v => (
                <Card key={v.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip label="Не опубликовано" size="small" color="warning" />
                    </Stack>
                    <Typography variant="h6">{v.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {v.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handlePublish('vacancies', v.id)}
                    >
                      Опубликовать
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">Нет вакансий на модерации</Alert>
          )}
        </Grid>

        {/* Блок для стажировок */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Стажировки на модерации
            </Typography>
            <Divider />
          </Box>

          {pending.internships.length > 0 ? (
            <Stack spacing={2}>
              {pending.internships.map(i => (
                <Card key={i.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip label="Не опубликовано" size="small" color="warning" />
                    </Stack>
                    <Typography variant="h6">{i.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {i.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handlePublish('internships', i.id)}
                    >
                      Опубликовать
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">Нет стажировок на модерации</Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;