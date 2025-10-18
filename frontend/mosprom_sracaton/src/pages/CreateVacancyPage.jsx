// src/pages/CreateVacancyPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';

const CreateVacancyPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      company_name: '',
      work_location: '',
      work_schedule: '',
      responsibilities: '',
      requirements: '',
      salary_min: '',
      salary_max: '',
      agree_personal_data: false,
    },
  });

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async (data) => {
    try {
      setError(null);

      // Преобразуем зарплату в числа, если поля не пустые
      const payload = { ...data };
      if (payload.salary_min === '') payload.salary_min = null;
      if (payload.salary_max === '') payload.salary_max = null;
      if (typeof payload.salary_min === 'string' && payload.salary_min !== '') {
        payload.salary_min = parseFloat(payload.salary_min);
      }
      if (typeof payload.salary_max === 'string' && payload.salary_max !== '') {
        payload.salary_max = parseFloat(payload.salary_max);
      }

      await api.post('/vacancies/', payload);
      setSuccess('Вакансия успешно создана и отправлена на модерацию!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Произошла ошибка при создании вакансии.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Создать новую вакансию
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Название вакансии */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Название вакансии"
            {...register('title', { required: 'Обязательное поле' })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          {/* Название компании */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="company_name"
            label="Название компании"
            {...register('company_name', { required: 'Обязательное поле' })}
            error={!!errors.company_name}
            helperText={errors.company_name?.message}
          />

          {/* Площадка */}
          <FormControl fullWidth margin="normal" required error={!!errors.work_location}>
            <InputLabel id="work_location-label">Площадка</InputLabel>
            <Select
              labelId="work_location-label"
              id="work_location"
              label="Площадка"
              {...register('work_location', { required: 'Обязательное поле' })}
            >
              <MenuItem value="">Выберите площадку</MenuItem>
              <MenuItem value="АЛАБУШЕВО">АЛАБУШЕВО</MenuItem>
              <MenuItem value="ПЕЧАТНИКИ">ПЕЧАТНИКИ</MenuItem>
              <MenuItem value="РУДНЕВО">РУДНЕВО</MenuItem>
              <MenuItem value="МИКРОН">МИКРОН</MenuItem>
              <MenuItem value="АНГСТРЕМ">АНГСТРЕМ</MenuItem>
              <MenuItem value="МИЭТ">МИЭТ</MenuItem>
            </Select>
          </FormControl>

          {/* Специальность */}
          <FormControl fullWidth margin="normal" required error={!!errors.work_schedule}>
            <InputLabel id="work_schedule-label">Специальность</InputLabel>
            <Select
              labelId="work_schedule-label"
              id="work_schedule"
              label="Специальность"
              {...register('work_schedule', { required: 'Обязательное поле' })}
            >
              <MenuItem value="">Выберите специальность</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="Административная работа">Административная работа</MenuItem>
              <MenuItem value="Другое">Другое</MenuItem>
              <MenuItem value="Логистика">Логистика</MenuItem>
              <MenuItem value="Маркетинг">Маркетинг</MenuItem>
              <MenuItem value="Медицина">Медицина</MenuItem>
              <MenuItem value="Микроэлектроника">Микроэлектроника</MenuItem>
              <MenuItem value="Продажи">Продажи</MenuItem>
              <MenuItem value="Производство">Производство</MenuItem>
              <MenuItem value="Финансы">Финансы</MenuItem>
              <MenuItem value="Юриспруденция">Юриспруденция</MenuItem>
            </Select>
          </FormControl>

          {/* Обязанности */}
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            id="responsibilities"
            label="Обязанности"
            {...register('responsibilities', { required: 'Обязательное поле' })}
            error={!!errors.responsibilities}
            helperText={errors.responsibilities?.message}
          />

          {/* Требования */}
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            id="requirements"
            label="Требования"
            {...register('requirements', { required: 'Обязательное поле' })}
            error={!!errors.requirements}
            helperText={errors.requirements?.message}
          />

          {/* Оклад от / до */}
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Оклад (необязательно)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                id="salary_min"
                label="От"
                {...register('salary_min')}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                id="salary_max"
                label="До"
                {...register('salary_max')}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>
          </Grid>

          {/* Чекбокс согласия */}
          <FormControlLabel
            control={
              <Checkbox
                {...register('agree_personal_data', {
                  required: 'Необходимо согласие на обработку персональных данных',
                })}
              />
            }
            label="Я согласен на обработку персональных данных"
            sx={{ mt: 2 }}
          />
          {errors.agree_personal_data && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              {errors.agree_personal_data.message}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!watch('agree_personal_data')}
          >
            Отправить на модерацию
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateVacancyPage;