import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// Turns any Axios error into a readable message for the user
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.request) {
    return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  }
  return error.message || 'Something went wrong';
}

export const getLeaves = async () => {
  const res = await api.get('/leaves');
  return res.data.data;
};

export const createLeave = async (leave) => {
  const res = await api.post('/leaves', leave);
  return res.data.data;
};

export const updateLeave = async (id, leave) => {
  const res = await api.put(`/leaves/${id}`, leave);
  return res.data.data;
};

export const deleteLeave = async (id) => {
  const res = await api.delete(`/leaves/${id}`);
  return res.data;
};
