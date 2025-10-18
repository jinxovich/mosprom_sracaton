// src/pages/ApplyPage.jsx

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  Paper,
  Container,
  CircularProgress
} from '@mui/material';

const ApplyPage = () => {
  const { id, type } = useParams(); // type: 'vacancy' или 'internship'
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [mode, setMode] = useState('form'); // 'form' или 'file'
  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
    education: '',
    experience: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!user || user.role !== 'applicant') {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error">
          Только зарегистрированные соискатели могут отправлять отклики.
        </Alert>
      </Container>
    );
  }

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = `/applications/${type}/${id}`;

    try {
      const formDataToSend = new FormData();

      if (mode === 'file') {
        if (!resumeFile) {
          throw new Error("Выберите файл резюме");
        }
        formDataToSend.append('resume_file', resumeFile);
      } else {
        // Подготавливаем данные: пустые строки → null, обрезаем пробелы
        const resumeData = {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          education: formData.education.trim() || null,
          experience: formData.experience.trim() || null,
          skills: formData.skills.trim() || null
        };

        // Валидация обязательных полей
        if (!resumeData.full_name || !resumeData.phone || !resumeData.email) {
          throw new Error("Заполните обязательные поля: ФИО, телефон и email");
        }

        // Гарантируем валидный JSON
        const jsonString = JSON.stringify(resumeData);
        formDataToSend.append('resume_data', jsonString);
      }

      await api.post(url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      let errorMsg = "Не удалось отправить отклик. Проверьте данные и попробуйте снова.";
      if (err.response?.data?.detail) {
        // FastAPI возвращает ошибку в виде строки или массива
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(d => d.msg).join('; ');
        }
      }
      setError(errorMsg);
      console.error("Submission error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="success.main">
          Отклик успешно отправлен!
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Ваше резюме поступило в личный кабинет HR компании.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Отклик на {type === 'vacancy' ? 'вакансию' : 'стажировку'}
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Способ подачи резюме</FormLabel>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel value="form" control={<Radio />} label="Заполнить анкету" />
            <FormControlLabel value="file" control={<Radio />} label="Загрузить файл (PDF, DOC)" />
          </RadioGroup>
        </FormControl>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {mode === 'form' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="ФИО *"
                name="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                required
                error={!formData.full_name.trim()}
              />
              <TextField
                label="Телефон *"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
                error={!formData.phone.trim()}
              />
              <TextField
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                type="email"
                error={!formData.email.trim()}
              />
              <TextField
                label="Образование"
                name="education"
                value={formData.education}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
              <TextField
                label="Опыт работы"
                name="experience"
                value={formData.experience}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
              <TextField
                label="Навыки"
                name="skills"
                value={formData.skills}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Box>
          ) : (
            <Box>
              <input
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                id="resume-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-file">
                <Button variant="outlined" component="span">
                  {resumeFile ? resumeFile.name : "Выберите файл резюме"}
                </Button>
              </label>
              {resumeFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Файл выбран: {resumeFile.name}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Отправить отклик'}
            </Button>
            <Button onClick={() => navigate(-1)} disabled={loading}>
              Отмена
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ApplyPage;