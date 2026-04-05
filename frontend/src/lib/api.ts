const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function parseError(res: Response): Promise<string> {
  if (res.status === 502 || res.status === 504) {
    return (
      "Cannot reach the API (bad gateway). Start the backend on port 5000: cd backend && npm run dev"
    );
  }
  if (res.status === 503) {
    return "API unavailable. Check that MongoDB is running and the backend started correctly.";
  }
  try {
    const data = await res.json();
    if (data && typeof data.message === "string") return data.message;
    return JSON.stringify(data);
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new Error(
      "Cannot connect to the API. Start the backend: cd backend && npm run dev (port 5000), or from the repo root run: npm run dev"
    );
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchApi(path);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: object): Promise<T> {
  const res = await fetchApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetchApi(path, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}
