const defaultApiUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : 'http://localhost:8080';

const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export { API_URL };

