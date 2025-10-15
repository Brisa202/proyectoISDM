// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;

// ✅ Corregido: ruta singular
export const getUserInfo = async () => {
  const response = await api.get("user/info/");
  return response.data;
};
