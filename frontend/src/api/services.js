import api from "./client";

export const signupAdmin = async (payload) => {
  const { data } = await api.post("/admin/signup", payload);
  return data;
};

export const loginAdmin = async (payload) => {
  const { data } = await api.post("/admin/login", payload);
  return data;
};

export const fetchForms = async () => {
  const { data } = await api.get("/forms");
  return data;
};

export const fetchFormById = async (id) => {
  const { data } = await api.get(`/forms/${id}`);
  return data;
};

export const createForm = async (payload) => {
  const { data } = await api.post("/forms", payload);
  return data;
};

export const updateForm = async (id, payload) => {
  const { data } = await api.put(`/forms/${id}`, payload);
  return data;
};

export const updateFormStatus = async (id, isActive) => {
  const { data } = await api.patch(`/forms/${id}/status`, { isActive });
  return data;
};

export const deleteForm = async (id) => {
  const { data } = await api.delete(`/forms/${id}`);
  return data;
};

export const submitResponse = async (formId, payload) => {
  const { data } = await api.post(`/responses/${formId}`, payload);
  return data;
};

export const fetchResponses = async (formId, page = 1, limit = 10) => {
  const { data } = await api.get(`/responses/${formId}?page=${page}&limit=${limit}`);
  return data;
};

export const fetchSummary = async (formId) => {
  const { data } = await api.get(`/forms/${formId}/summary`);
  return data;
};

export const buildCsvUrl = (formId, page = 1, limit = 50) => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return `${base}/responses/${formId}?page=${page}&limit=${limit}&format=csv`;
};
