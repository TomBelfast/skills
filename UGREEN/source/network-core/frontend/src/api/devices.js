import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchDevices() {
  const { data } = await axios.get(`${API_BASE}/api/v1/devices`);
  return data;
}

export async function fetchLinks() {
  const { data } = await axios.get(`${API_BASE}/api/v1/links`);
  return data;
}
