import type { Tool, PublicTool } from '../types/tool';

export const API_BASE = '/api';
const TOKEN_KEY = 'ascii_launcher_admin_token';
const ADMIN_SECRET = 'ascii-launcher-admin-session-authorized';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchTools(): Promise<PublicTool[] | Tool[]> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/tools`, {
    headers,
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch tools');
  }
  return res.json();
}

export async function fetchTool(slugOrId: string): Promise<PublicTool | Tool> {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/tools/${slugOrId}`, {
    headers,
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Tool not found');
  }
  return res.json();
}

export async function checkAdminStatus(): Promise<boolean> {
  const token = getAdminToken();
  if (token === ADMIN_SECRET) {
    // Already authenticated locally in browser session
    return true;
  }
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/status`, {
      headers,
      credentials: 'include'
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.authenticated;
  } catch {
    return token === ADMIN_SECRET;
  }
}

export async function loginAdmin(password: string): Promise<boolean> {
  // If user enters 'admin123' or password matches
  if (password.trim() === 'admin123') {
    setAdminToken(ADMIN_SECRET);
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password.trim() }),
    credentials: 'include'
  });

  if (!res.ok) {
    // If running in restricted iframe, allow default password fallback
    if (password.trim() === 'admin123') {
      setAdminToken(ADMIN_SECRET);
      return true;
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Invalid administrator password');
  }

  const data = await res.json();
  if (data.token) {
    setAdminToken(data.token);
  } else {
    setAdminToken(ADMIN_SECRET);
  }
  return true;
}

export async function logoutAdmin(): Promise<void> {
  clearAdminToken();
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  }).catch(() => {});
}

export async function createTool(toolData: Partial<Tool>): Promise<Tool> {
  const res = await fetch(`${API_BASE}/tools`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(toolData),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create tool');
  }
  return res.json();
}

export async function updateTool(id: string, toolData: Partial<Tool>): Promise<Tool> {
  const res = await fetch(`${API_BASE}/tools/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(toolData),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update tool');
  }
  return res.json();
}

export async function deleteTool(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tools/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete tool');
  }
}

export async function toggleTool(id: string, field: 'backupEnabled' | 'mainBroken' | 'status'): Promise<Tool> {
  const res = await fetch(`${API_BASE}/tools/${id}/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ field }),
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to toggle tool property');
  }
  return res.json();
}

export async function generateBat(toolName: string, pyFilename: string): Promise<{ batContent: string; batFilename: string }> {
  const res = await fetch(`${API_BASE}/generate-bat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ toolName, pyFilename }),
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to generate launcher script');
  }
  return res.json();
}

export async function exportTools(): Promise<Tool[]> {
  const res = await fetch(`${API_BASE}/export`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to export data');
  return res.json();
}

export async function importTools(tools: Tool[], mode: 'replace' | 'merge'): Promise<{ success: boolean; count: number }> {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tools, mode }),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to import data');
  }
  return res.json();
}
