// API URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mymagiccard.onrender.com';

export const API_URLS = {
  baseURL: API_BASE_URL,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/user/register`,
  users: `${API_BASE_URL}/api/users`,
  profile: `${API_BASE_URL}/api/me`,
  setup: `${API_BASE_URL}/api/setup`,
  image: `${API_BASE_URL}/api/image`,
  linkPreview: `${API_BASE_URL}/api/link-preview`,
  generateProfile: `${API_BASE_URL}/api/generate-profile`,
  public: (id) => `${API_BASE_URL}/public/${id}`,
}; 