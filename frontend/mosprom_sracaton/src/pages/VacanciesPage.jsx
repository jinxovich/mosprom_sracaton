import React, { useEffect, useState } from 'react';
import api from '../api';
import { Typography, CircularProgress, Box, Card, CardContent, CardActions, Button } from '@mui/material';

const VacanciesPage = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        setLoading(true);
        // Предполагается, что у вас есть эндпоинт /vacancies для получения списка
        const response = await api.get('/vacancies'); 
        setVacancies(response.data);
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить вакансии. Возможно, бэкенд не запущен.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Открытые вакансии и стажировки
      </Typography>

      {error && <Typography color="error">{error}</Typography>}
      
      {vacancies.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id} variant="outlined">
              <CardContent>
                <Typography variant="h5" component="div">
                  {vacancy.title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {vacancy.company_name || 'Название компании'} 
                </Typography>
                <Typography variant="body2" noWrap>
                  {vacancy.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Подробнее</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        !error && <Typography>На данный момент открытых вакансий нет.</Typography>
      )}
    </Box>
  );
};

export default VacanciesPage;