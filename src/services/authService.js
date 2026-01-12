import api from './api';

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
            userId: response.data.userId,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role,
            businessName: response.data.businessName
        }));
    }
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
            userId: response.data.userId,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role,
            businessName: response.data.businessName
        }));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
