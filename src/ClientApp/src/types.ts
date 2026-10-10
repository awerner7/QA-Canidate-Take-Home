export type Priority = 'Low' | 'Medium' | 'High';
export type TaskPriority = Priority;
export type StatusFilter = 'all' | 'active' | 'completed';
export type SortOption = 'created' | 'title' | 'priority' | 'dueDate';

export interface Task {
  id: number;
  title: string;
  description: string;
  labels: string;
  priority: Priority;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  labels: string;
  priority: Priority;
  dueDate: string | null;
}

export interface UpdateTaskPayload extends TaskPayload {
  isCompleted: boolean;
}
