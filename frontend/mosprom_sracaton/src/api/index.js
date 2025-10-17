import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Создаем инстанс Axios с базовым URL вашего API
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Убедитесь, что порт и адрес верны
});

// Перехватчик (interceptor) для автоматического добавления токена авторизации
// Он будет срабатывать перед каждым запросом, отправленным через этот инстанс `api`
api.interceptors.request.use(
  (config) => {
    // Получаем токен напрямую из состояния Zustand
    const token = useAuthStore.getState().token;
    
    // Если токен существует, добавляем его в заголовок Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // В случае ошибки на этапе формирования запроса, отклоняем Promise
    return Promise.reject(error);
  }
);

export default api;