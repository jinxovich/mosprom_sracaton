import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

const CreateInternshipPage = () => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
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

      const payload = { ...data };

      if (payload.salary_min === '') {
        payload.salary_min = null;
      } else {
        payload.salary_min = parseFloat(payload.salary_min);
      }

      if (payload.salary_max === '') {
        payload.salary_max = null;
      } else {
        payload.salary_max = parseFloat(payload.salary_max);
      }

      payload.salary_currency = 'RUB';

      await api.post('/internships/', payload);
      setSuccess('Стажировка успешно создана и отправлена на модерацию!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Произошла ошибка при создании стажировки.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Создать новую стажировку
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {success}
            </Alert>
          )}

          {/* Название стажировки */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Название стажировки"
            {...register('title', { required: 'Обязательное поле' })}
            error={Boolean(errors.title)}
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
            error={Boolean(errors.company_name)}
            helperText={errors.company_name?.message}
          />

          {/* Площадка (work_location) */}
          <Controller
            name="work_location"
            control={control}
            rules={{ required: 'Обязательное поле' }}
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                required
                error={Boolean(errors.work_location)}
              >
                <InputLabel id="work_location-label">Площадка</InputLabel>
                <Select
                  {...field}
                  labelId="work_location-label"
                  id="work_location"
                  label="Площадка"
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
            )}
          />

          {/* Специальность (work_schedule) */}
          <Controller
            name="work_schedule"
            control={control}
            rules={{ required: 'Обязательное поле' }}
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                required
                error={Boolean(errors.work_schedule)}
              >
                <InputLabel id="work_schedule-label">Специальность</InputLabel>
                <Select
                  {...field}
                  labelId="work_schedule-label"
                  id="work_schedule"
                  label="Специальность"
                >
                  <MenuItem value="">Выберите специальность</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Административная работа">
                    Административная работа
                  </MenuItem>
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
            )}
          />

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
            error={Boolean(errors.responsibilities)}
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
            error={Boolean(errors.requirements)}
            helperText={errors.requirements?.message}
          />

          {/* Стипендия */}
          <Typography variant="subtitle1" sx={{ marginTop: 3, marginBottom: 1 }}>
            Стипендия (необязательно)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                id="salary_min"
                label="От"
                {...register('salary_min')}
                inputProps={{ min: 0, step: 100 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                id="salary_max"
                label="До"
                {...register('salary_max')}
                inputProps={{ min: 0, step: 100 }}
              />
            </Grid>
          </Grid>

          {/* Согласие на обработку персональных данных */}
          <FormControlLabel
            control={
              <Checkbox
                {...register('agree_personal_data', {
                  required: 'Необходимо согласие на обработку персональных данных',
                })}
              />
            }
            label="Я согласен на обработку персональных данных"
            sx={{ marginTop: 2 }}
          />
          {errors.agree_personal_data && (
            <Typography color="error" variant="caption" sx={{ marginLeft: 2 }}>
              {errors.agree_personal_data.message}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{ marginTop: 3, marginBottom: 2 }}
            disabled={!watch('agree_personal_data')}
          >
            Отправить на модерацию
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateInternshipPage;