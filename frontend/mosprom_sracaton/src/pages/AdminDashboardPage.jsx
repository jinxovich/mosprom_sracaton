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
    Divider,
    TextField,
  } from '@mui/material';
  import CheckCircleIcon from '@mui/icons-material/CheckCircle';
  import CancelIcon from '@mui/icons-material/Cancel';

  const AdminDashboardPage = () => {
    const [pending, setPending] = useState({ vacancies: [], internships: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rejectionReasons, setRejectionReasons] = useState({});

    const fetchData = async () => {
      try {
        setLoading(true);
        const [vacanciesRes, internshipsRes] = await Promise.all([
          api.get('/moderation/vacancies/pending'),
          api.get('/moderation/internships/pending'),
        ]);
        setPending({
          vacancies: vacanciesRes.data,
          internships: internshipsRes.data,
        });
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить данные для модерации.');
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
        // Удаляем из локального списка
        setPending((prev) => ({
          ...prev,
          [type]: prev[type].filter((item) => item.id !== id),
        }));
      } catch (err) {
        alert('Ошибка при публикации.');
        console.error(err);
      }
    };

    const handleReject = async (type, id) => {
      const key = `${type}-${id}`;
      const reason = rejectionReasons[key]?.trim();
      if (!reason) {
        alert('Пожалуйста, укажите причину отклонения (минимум 10 символов).');
        return;
      }

      try {
        await api.patch(
          `/moderation/${type}/${id}/reject`,
          { rejection_reason: reason },
          { headers: { 'Content-Type': 'application/json' } }
        );
        // Удаляем из локального списка (запись больше не в pending)
        setPending((prev) => ({
          ...prev,
          [type]: prev[type].filter((item) => item.id !== id),
        }));
        // Очищаем поле ввода
        setRejectionReasons((prev) => {
          const newReasons = { ...prev };
          delete newReasons[key];
          return newReasons;
        });
      } catch (err) {
        const msg = err.response?.data?.detail || 'Ошибка при отклонении заявки.';
        alert(msg);
        console.error(err);
      }
    };

    const updateRejectionReason = (type, id, value) => {
      const key = `${type}-${id}`;
      setRejectionReasons((prev) => ({
        ...prev,
        [key]: value,
      }));
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
            icon={<CancelIcon />}
            label={`Всего на модерации: ${totalPending}`}
            color="warning"
            size="medium"
          />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={4}>
          {/* Вакансии */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Вакансии на модерации
              </Typography>
              <Divider />
            </Box>

            {pending.vacancies.length > 0 ? (
              <Stack spacing={2}>
                {pending.vacancies.map((v) => {
                  const key = `vacancies-${v.id}`;
                  return (
                    <Card key={v.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip label="Не опубликовано" size="small" color="warning" />
                        </Stack>
                        <Typography variant="h6" gutterBottom>
                          {v.title}
                        </Typography>
                        {v.company_name && (
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Компания: {v.company_name}
                          </Typography>
                        )}
                        {v.work_location && (
                          <Typography variant="body2" color="text.secondary">
                            📍 Место работы: {v.work_location}
                          </Typography>
                        )}
                        {v.work_schedule && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            🕒 График: {v.work_schedule}
                          </Typography>
                        )}
                        {v.responsibilities && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Обязанности:</strong> {v.responsibilities}
                          </Typography>
                        )}
                        {v.requirements && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Требования:</strong> {v.requirements}
                          </Typography>
                        )}
                        {v.conditions && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Условия:</strong> {v.conditions}
                          </Typography>
                        )}
                        {(v.salary_min || v.salary_max) && (
                          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                            💰 {v.salary_min ? `от ${v.salary_min.toLocaleString()}` : ''}
                            {v.salary_max ? ` до ${v.salary_max.toLocaleString()}` : ''} {v.salary_currency}
                          </Typography>
                        )}

                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Причина отклонения"
                          variant="outlined"
                          value={rejectionReasons[key] || ''}
                          onChange={(e) => updateRejectionReason('vacancies', v.id, e.target.value)}
                          sx={{ mt: 2 }}
                        />
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
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject('vacancies', v.id)}
                        >
                          Отклонить
                        </Button>
                      </CardActions>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Alert severity="info">Нет вакансий на модерации</Alert>
            )}
          </Grid>

          {/* Стажировки */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Стажировки на модерации
              </Typography>
              <Divider />
            </Box>

            {pending.internships.length > 0 ? (
              <Stack spacing={2}>
                {pending.internships.map((i) => {
                  const key = `internships-${i.id}`;
                  return (
                    <Card key={i.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip label="Не опубликовано" size="small" color="warning" />
                        </Stack>
                        <Typography variant="h6" gutterBottom>
                          {i.title}
                        </Typography>
                        {i.company_name && (
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Компания: {i.company_name}
                          </Typography>
                        )}
                        {i.work_location && (
                          <Typography variant="body2" color="text.secondary">
                            📍 Площадка: {i.work_location}
                          </Typography>
                        )}
                        {i.work_schedule && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            💼 Специальность: {i.work_schedule}
                          </Typography>
                        )}
                        {i.responsibilities && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Обязанности:</strong> {i.responsibilities}
                          </Typography>
                        )}
                        {i.requirements && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Требования:</strong> {i.requirements}
                          </Typography>
                        )}
                        {(i.salary_min || i.salary_max) && (
                          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                            💰 {i.salary_min ? `от ${i.salary_min.toLocaleString()}` : ''}
                            {i.salary_max ? ` до ${i.salary_max.toLocaleString()}` : ''} {i.salary_currency}
                          </Typography>
                        )}

                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Причина отклонения"
                          variant="outlined"
                          value={rejectionReasons[key] || ''}
                          onChange={(e) => updateRejectionReason('internships', i.id, e.target.value)}
                          sx={{ mt: 2 }}
                        />
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
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject('internships', i.id)}
                        >
                          Отклонить
                        </Button>
                      </CardActions>
                    </Card>
                  );
                })}
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