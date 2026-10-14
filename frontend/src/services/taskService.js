import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  return error.message || 'Something went wrong';
}

export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data.data;
};

export const createTask = async (task) => {
  const response = await api.post('/tasks', task);
  return response.data.data;
};

export const updateTask = async (id, task) => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};
