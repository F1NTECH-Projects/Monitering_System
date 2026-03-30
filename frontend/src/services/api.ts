import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const clinicService = {
  getStats: (clinicId: string) => api.get(`/clinics/${clinicId}/stats`),
  getClinic: (clinicId: string) => api.get(`/clinics/${clinicId}`),
  updateClinic: (clinicId: string, data: any) => api.patch(`/clinics/${clinicId}`, data),
};

export const patientService = {
  getAll: (clinicId: string) => api.get(`/patients/clinic/${clinicId}`),
  getById: (patientId: string) => api.get(`/patients/${patientId}`),
  add: (data: any) => api.post("/patients/add", data),
  update: (patientId: string, data: any) => api.patch(`/patients/${patientId}`, data),
  delete: (patientId: string) => api.delete(`/patients/${patientId}`),
};

export const appointmentService = {
  getByClinic: (clinicId: string, params?: any) => api.get(`/appointments/clinic/${clinicId}`, { params }),
  schedule: (data: any) => api.post("/appointments/schedule", data),
  complete: (id: string) => api.post(`/appointments/${id}/complete`),
  markNoShow: (id: string) => api.post(`/appointments/${id}/mark-noshow`),
  update: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
};

export default api;
