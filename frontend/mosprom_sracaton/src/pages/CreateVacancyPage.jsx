import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { TextField, Button, Container, Box, Typography, Alert } from '@mui/material';

const CreateVacancyPage = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async (data) => {
    try {
      setError(null);
      await api.post('/vacancies/', data);
      setSuccess('Вакансия успешно создана и отправлена на модерацию!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError("Произошла ошибка при создании вакансии.");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>Создать новую вакансию</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <TextField margin="normal" required fullWidth id="title" label="Название вакансии" {...register('title')} />
          <TextField margin="normal" required fullWidth multiline rows={4} id="description" label="Описание" {...register('description')} />
          
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>Отправить на модерацию</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateVacancyPage;