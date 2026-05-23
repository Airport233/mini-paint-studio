import api from './api';

interface AuthResponse {
  token: string;
  email: string;
}

interface ErrorResponse {
  status: number;
  message: string;
}

export const authService = {
  register: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/api/auth/register', { email, password }).then((r) => r.data),

  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data),

  forgotPassword: (email: string): Promise<void> =>
    api.post('/api/auth/forgot-password', { email }).then((r) => r.data),
};
