// src/pages/HomePage.jsx

import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';
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
  Stack
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

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

  // ИСПРАВЛЕНО: Эта функция больше не нужна, так как отклик происходит на отдельной странице
  // const handleApply = ...

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Открытые возможности в ОЭЗ "Технополис Москва"
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Grid container spacing={4}>
        {/* Вакансии */}
        {/* ИСПРАВЛЕНО: Grid prop 'size' заменен на 'item' */}
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <WorkIcon color="primary" fontSize="large" />
            <Typography variant="h4" component="h2">
              Вакансии
            </Typography>
            <Chip label={items.vacancies.length} color="primary" />
          </Stack>

          {items.vacancies.length > 0 ? (
            <Stack spacing={2}>
              {items.vacancies.map(v => (
                <Card key={v.id} variant="outlined" sx={{ 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
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
                        <strong>Обязанности:</strong> {v.responsibilities.slice(0, 150)}...
                      </Typography>
                    )}

                    {v.requirements && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Требования:</strong> {v.requirements.slice(0, 150)}...
                      </Typography>
                    )}

                    {v.conditions && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Условия:</strong> {v.conditions.slice(0, 150)}...
                      </Typography>
                    )}

                    {v.additional_info && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Дополнительно:</strong> {v.additional_info.slice(0, 150)}...
                      </Typography>
                    )}

                    {(v.salary_min || v.salary_max) && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        💰 {v.salary_min ? `от ${v.salary_min.toLocaleString()}` : ''} 
                        {v.salary_max ? ` до ${v.salary_max.toLocaleString()}` : ''} {v.salary_currency}
                      </Typography>
                    )}
                  </CardContent>

                  {(user?.role === 'applicant') && (
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => {
                          // ИСПРАВЛЕНО: Используется абсолютный путь со слэшем в начале
                          navigate(`/apply/vacancy/${v.id}`);
                        }}
                      >
                        Откликнуться
                      </Button>
                    </CardActions>
                  )}
                </Card>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">Опубликованных вакансий пока нет.</Alert>
          )}
        </Grid>
        
        {/* Стажировки */}
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <SchoolIcon color="secondary" fontSize="large" />
            <Typography variant="h4" component="h2">
              Стажировки
            </Typography>
            <Chip label={items.internships.length} color="secondary" />
          </Stack>

          {items.internships.length > 0 ? (
            <Stack spacing={2}>
              {items.internships.map(i => (
                <Card key={i.id} variant="outlined" sx={{ 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
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
                        <strong>Обязанности:</strong> {i.responsibilities.slice(0, 150)}...
                      </Typography>
                    )}
                    {i.requirements && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Требования:</strong> {i.requirements.slice(0, 150)}...
                      </Typography>
                    )}
                    {(i.salary_min || i.salary_max) && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        💰 {i.salary_min ? `от ${i.salary_min.toLocaleString()}` : ''} 
                        {i.salary_max ? ` до ${i.salary_max.toLocaleString()}` : ''} {i.salary_currency}
                      </Typography>
                    )}
                  </CardContent>
                  {(user?.role === 'applicant') && (
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          // ИСПРАВЛЕНО: Используется абсолютный путь со слэшем в начале
                          navigate(`/apply/internship/${i.id}`);
                        }}
                      >
                        Откликнуться
                      </Button>
                    </CardActions>
                  )}
                </Card>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">Опубликованных стажировок пока нет.</Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;