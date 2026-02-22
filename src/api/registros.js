const BASE = import.meta.env.VITE_API_URL ?? '';

export async function saveRegistro(registro) {
  if (!BASE) return { ok: false };
  try {
    const res = await fetch(`${BASE}/api/registros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function loadRegistros() {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/api/registros`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
