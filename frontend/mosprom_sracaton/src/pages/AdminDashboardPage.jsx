// frontend/mosprom_sracaton/src/pages/AdminDashboardPage.jsx
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
import PendingIcon from '@mui/icons-material/Pending';

const AdminDashboardPage = () => {
  const [pending, setPending] = useState({ vacancies: [], internships: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [rejectionErrors, setRejectionErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vacanciesRes, internshipsRes, usersRes] = await Promise.all([
        api.get('/moderation/vacancies/pending'),
        api.get('/moderation/internships/pending'),
        api.get('/moderation/users/pending'),
      ]);
      setPending({
        vacancies: vacanciesRes.data,
        internships: internshipsRes.data,
        users: usersRes.data,
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
    
    if (!reason || reason.length < 10) {
      setRejectionErrors({
        ...rejectionErrors,
        [key]: 'Причина отклонения должна содержать минимум 10 символов'
      });
      return;
    }

    try {
      await api.patch(
        `/moderation/${type}/${id}/reject`,
        { rejection_reason: reason }
      );
      
      setPending((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item.id !== id),
      }));
      
      setRejectionReasons((prev) => {
        const newReasons = { ...prev };
        delete newReasons[key];
        return newReasons;
      });
      
      setRejectionErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
      
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка при отклонении заявки.';
      setRejectionErrors({
        ...rejectionErrors,
        [key]: msg
      });
      console.error(err);
    }
  };

  const updateRejectionReason = (type, id, value) => {
    const key = `${type}-${id}`;
    setRejectionReasons((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    if (rejectionErrors[key]) {
      setRejectionErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalPending = pending.vacancies.length + pending.internships.length + pending.users.length;

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
        {/* Вакансии */}
        <Grid item xs={12} md={4}>
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
                        <Typography variant="body2" color="text.secondary">
                          Компания: {v.company_name}
                        </Typography>
                      )}
                      
                      {v.work_location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {v.work_location}
                        </Typography>
                      )}

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Причина отклонения (минимум 10 символов) *"
                        variant="outlined"
                        value={rejectionReasons[key] || ''}
                        onChange={(e) => updateRejectionReason('vacancies', v.id, e.target.value)}
                        error={!!rejectionErrors[key]}
                        helperText={rejectionErrors[key] || `${(rejectionReasons[key] || '').length}/10 символов`}
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
                        Одобрить
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject('vacancies', v.id)}
                        disabled={!rejectionReasons[key] || rejectionReasons[key].trim().length < 10}
                      >
                        Отклонить
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Card variant="outlined">
              <CardContent>
                <Alert severity="info">Нет вакансий на модерации</Alert>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Стажировки */}
        <Grid item xs={12} md={4}>
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
                        <Typography variant="body2" color="text.secondary">
                          Компания: {i.company_name}
                        </Typography>
                      )}
                      
                      {i.work_location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {i.work_location}
                        </Typography>
                      )}

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Причина отклонения (минимум 10 символов) *"
                        variant="outlined"
                        value={rejectionReasons[key] || ''}
                        onChange={(e) => updateRejectionReason('internships', i.id, e.target.value)}
                        error={!!rejectionErrors[key]}
                        helperText={rejectionErrors[key] || `${(rejectionReasons[key] || '').length}/10 символов`}
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
                        Одобрить
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject('internships', i.id)}
                        disabled={!rejectionReasons[key] || rejectionReasons[key].trim().length < 10}
                      >
                        Отклонить
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Card variant="outlined">
              <CardContent>
                <Alert severity="info">Нет стажировок на модерации</Alert>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Пользователи */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Заявки на регистрацию
            </Typography>
            <Divider />
          </Box>

          {pending.users.length > 0 ? (
            <Stack spacing={2}>
              {pending.users.map((u) => {
                const key = `users-${u.id}`;
                return (
                  <Card key={u.id} variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip label="Не одобрено" size="small" color="warning" />
                      </Stack>
                      
                      <Typography variant="h6" gutterBottom>
                        {u.email}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Роль: {u.role === 'hr' ? 'HR компании' : 'Представитель ВУЗа'}
                      </Typography>

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Причина отклонения (минимум 10 символов) *"
                        variant="outlined"
                        value={rejectionReasons[key] || ''}
                        onChange={(e) => updateRejectionReason('users', u.id, e.target.value)}
                        error={!!rejectionErrors[key]}
                        helperText={rejectionErrors[key] || `${(rejectionReasons[key] || '').length}/10 символов`}
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handlePublish('users', u.id)}
                      >
                        Одобрить
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject('users', u.id)}
                        disabled={!rejectionReasons[key] || rejectionReasons[key].trim().length < 10}
                      >
                        Отклонить
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Card variant="outlined">
              <CardContent>
                <Alert severity="info">Нет заявок на регистрацию</Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;