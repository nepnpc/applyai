const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function get(path: string) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

export async function post(path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function put(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
