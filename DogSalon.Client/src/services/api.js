import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7133/api";

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function normalizeError(err) {
  if (!err.response) {
    return {
      ...err,
      normalizedMessage: "שגיאת רשת / השרת לא זמין 🌐",
      status: 0,
    };
  }

  const { status, data } = err.response;

  if (data?.errors) {
    const validationErrors = Object.values(data.errors).flat().join(" | ");
    return { ...err, normalizedMessage: validationErrors, status };
  }

  if (data?.detail) {
    return { ...err, normalizedMessage: data.detail, status };
  }

  if (data?.title) {
    return { ...err, normalizedMessage: data.title, status };
  }

  return { ...err, normalizedMessage: "אירעה שגיאה לא צפויה ❌", status };
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(normalizeError(err))
);

export const api = {
  login: (dto) => http.post("/auth/login", dto),
  register: (dto) => http.post("/auth/register", dto),
  getQueue: (params) => http.get("/appointments/queue", { params }),
  getMyAppointments: () => http.get("/appointments/me"),
  createAppointment: (dto) => http.post("/appointments", dto),
  updateAppointment: (id, dto) => http.put(`/appointments/${id}`, dto),
  deleteAppointment: (id) => http.delete(`/appointments/${id}`),
};