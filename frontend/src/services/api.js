import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token if user is logged in
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('securecheck_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Code Scanner
  scanCode: async (payload) => {
    const res = await apiClient.post('/audits/scan-code', payload);
    return res.data;
  },

  // Questions & Templates
  getTemplates: async () => {
    const res = await apiClient.get('/questions/templates');
    return res.data;
  },

  getTemplateQuestions: async (templateId) => {
    const res = await apiClient.get(`/questions/template/${templateId}`);
    return res.data;
  },

  generateAIQuestions: async (payload) => {
    const res = await apiClient.post('/questions/generate-ai', payload);
    return res.data;
  },

  // Audits
  createAudit: async (auditData) => {
    const res = await apiClient.post('/audits', auditData);
    return res.data;
  },

  getAudits: async (params = {}) => {
    const res = await apiClient.get('/audits', { params });
    return res.data;
  },

  getAudit: async (auditId) => {
    const res = await apiClient.get(`/audits/${auditId}`);
    return res.data;
  },

  deleteAudit: async (auditId) => {
    const res = await apiClient.delete(`/audits/${auditId}`);
    return res.data;
  },

  compareAudits: async (auditId1, auditId2) => {
    const res = await apiClient.post('/audits/compare', {
      audit_id_1: auditId1,
      audit_id_2: auditId2,
    });
    return res.data;
  },

  exportMarkdownUrl: (auditId) => `/api/audits/${auditId}/export-markdown`,

  // Projects
  getProjects: async () => {
    const res = await apiClient.get('/projects');
    return res.data;
  },

  // Settings & Status
  getSystemStatus: async () => {
    const res = await apiClient.get('/settings/status');
    return res.data;
  },

  updateSettings: async (settingsData) => {
    const res = await apiClient.post('/settings', settingsData);
    return res.data;
  },
};
