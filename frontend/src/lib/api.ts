import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
