import axios from 'axios';

const BASE_URL = 'https://localhost:7133/api';

export const api = {
    login: (data) => axios.post(`${BASE_URL}/Auth/login`, data),
    register: (data) => axios.post(`${BASE_URL}/Auth/register`, data),
    getMyAppointments: (userId) => axios.get(`${BASE_URL}/Appointments/user/${userId}`),
    getAllAppointments: () => axios.get(`${BASE_URL}/Appointments/all`),
    createAppointment: (data) => axios.post(`${BASE_URL}/Appointments`, data),
    updateAppointment: (id, data) => axios.put(`${BASE_URL}/Appointments/${id}`, data),
    deleteAppointment: (id, userId) => axios.delete(`${BASE_URL}/Appointments/${id}/${userId}`)
};