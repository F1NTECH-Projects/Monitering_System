import axios from "axios";
import { useAuth } from "@/stores/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuth.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: (data: { owner_email: string; password: string }) => api.post("/auth/login", data),
  register: (data: unknown) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// Alias for backward compat with login page imports
export const authAPI = authService;

export const clinicService = {
  getStats: (clinicId: string) => api.get(`/clinics/${clinicId}`),
  getDashboard: (clinicId: string) => api.get(`/clinics/${clinicId}/dashboard`),
  updateClinic: (clinicId: string, data: unknown) => api.patch(`/clinics/${clinicId}`, data),
};

export const patientService = {
  getAll: (clinicId: string, page = 1) => api.get(`/patients/clinic/${clinicId}`, { params: { page } }),
  getById: (patientId: string) => api.get(`/patients/${patientId}`),
  add: (data: unknown) => api.post("/patients/add", data),
  update: (patientId: string, data: unknown) => api.patch(`/patients/${patientId}`, data),
  delete: (patientId: string) => api.delete(`/patients/${patientId}`),
};

export const appointmentService = {
  getByClinic: (clinicId: string, params?: unknown) =>
    api.get(`/appointments/clinic/${clinicId}`, { params }),
  schedule: (data: unknown) => api.post("/appointments/schedule", data),
  complete: (id: string) => api.post(`/appointments/${id}/complete`),
  markNoShow: (id: string) => api.post(`/appointments/${id}/mark-noshow`),
  update: (id: string, data: unknown) => api.patch(`/appointments/${id}`, data),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
  getLogs: (clinicId: string) => api.get(`/appointments/logs/${clinicId}`),
  triggerReminders: () => api.post("/appointments/trigger-reminders"),
};

export default api;
