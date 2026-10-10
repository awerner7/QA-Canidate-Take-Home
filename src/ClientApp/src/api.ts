import type { SortOption, StatusFilter, Task, TaskPayload, UpdateTaskPayload } from './types';

export type {
  Priority,
  SortOption,
  StatusFilter,
  Task,
  TaskPayload,
  TaskPriority,
  UpdateTaskPayload,
} from './types';

const API_BASE = '/api/tasks';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listTasks(status: StatusFilter, search: string, sort: SortOption): Promise<Task[]> {
  const params = new URLSearchParams();
  if (status !== 'all') {
    params.set('status', status);
  }
  if (search.trim()) {
    params.set('search', search);
  }
  if (sort !== 'created') {
    params.set('sort', sort);
  }

  const query = params.toString();
  return request<Task[]>(`${API_BASE}${query ? `?${query}` : ''}`);
}

export function createTask(payload: TaskPayload): Promise<Task> {
  return request<Task>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  return request<Task>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function toggleTask(id: number): Promise<Task> {
  return request<Task>(`${API_BASE}/${id}/toggle`, { method: 'POST' });
}

export function deleteTask(id: number): Promise<void> {
  return request<void>(`${API_BASE}/${id}`, { method: 'DELETE' });
}

export function clearCompleted(): Promise<{ removed: number }> {
  return request<{ removed: number }>(`${API_BASE}/clear-completed`, {
    method: 'POST',
  });
}
