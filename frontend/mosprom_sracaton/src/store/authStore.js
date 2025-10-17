import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      
      // Метод для сохранения данных после успешного входа
      login: (token, user) => set({ token, user }),
      
      // Метод для очистки данных при выходе
      logout: () => set({ token: null, user: null }),
      
      // ИСПРАВЛЕНО: Полностью удаляем метод isAuthenticated.
      // Он был причиной проблемы, так как не был реактивным.
    }),
    {
      name: 'auth-storage',
    }
  )
);