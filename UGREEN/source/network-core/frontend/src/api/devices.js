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
export async function createDevice(deviceData) {
  const { data } = await axios.post(`${API_BASE}/api/v1/devices`, deviceData);
  return data;
}

export async function createLink(linkData) {
  const { data } = await axios.post(`${API_BASE}/api/v1/links`, linkData);
  return data;
}

export async function patchDevice(id, patch) {
  const { data } = await axios.patch(`${API_BASE}/api/v1/devices/${id}`, patch);
  return data;
}

export async function deleteDevice(id) {
  await axios.delete(`${API_BASE}/api/v1/devices/${id}`);
}
