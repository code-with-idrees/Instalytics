import axios from 'axios';

// Use Next.js API route instead of direct backend call
const API_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeAccount = async (accessToken: string) => {
  const response = await apiClient.post('/analyze', {
    access_token: accessToken,
  });
  return response.data;
};
