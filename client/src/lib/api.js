const BASE = import.meta.env.VITE_API_URL || '/api';
const KEY = 'spendwise_token';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY));

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the API is running and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && getToken()) window.dispatchEvent(new Event('spendwise:signed-out'));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' })
};

export async function downloadCsv() {
  const res = await fetch(BASE + '/transactions/export.csv', { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error('Could not export your data.');
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: 'spendwise-transactions.csv' });
  a.click();
  URL.revokeObjectURL(url);
}
