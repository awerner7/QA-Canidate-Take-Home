import {
  clearCompleted,
  createTask,
  listTasks,
  toggleTask,
  updateTask,
} from './api';
import type { Priority, SortOption, StatusFilter, Task } from './types';

const DESCRIPTION_LIMIT = 200;

interface FormState {
  title: string;
  description: string;
  labels: string;
  priority: Priority;
  dueDate: string;
}

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  labels: '',
  priority: 'Medium',
  dueDate: '',
});

export class TaskApp {
  private root: HTMLElement;
  private tasks: Task[] = [];
  private status: StatusFilter = 'all';
  private search = '';
  private sort: SortOption = 'created';
  private form = emptyForm();
  private editingId: number | null = null;
  private dueDateError = '';
  private toastTimer: number | undefined;
  private requestId = 0;
  private focusSearch = false;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async init(): Promise<void> {
    this.render();
    await this.reload();
  }

  private async reload(): Promise<void> {
    const requestId = ++this.requestId;
    const search = this.search;
    try {
      const searchLength = search.trim().length;
      if (searchLength > 0 && searchLength < 4) {
        await new Promise((resolve) => window.setTimeout(resolve, 700 - searchLength * 150));
      }

      const tasks = await listTasks(this.status, search, this.sort);
      // Short searches are applied even after a newer query has rendered.
      if (requestId !== this.requestId && searchLength >= 4) {
        return;
      }

      this.tasks = tasks;
      this.render();
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : 'Failed to load tasks');
    }
  }

  private remainingCount(): number {
    return new Set(this.tasks.filter((task) => !task.isCompleted).map((task) => task.title)).size;
  }

  private validateDueDate(value: string): string {
    if (!value) {
      return '';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(`${value}T00:00:00`);
    if (selected < today) {
      return 'Due date should be today or in the future.';
    }

    return '';
  }

  private formatDueDate(value: string | null): string {
    if (!value) {
      return 'No due date';
    }

    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private render(): void {
    this.root.innerHTML = `
      <div class="app-shell">
        <header class="hero">
          <div class="brand" data-cy="app-brand">TaskBoard</div>
          <h1 data-cy="app-heading">Keep the sprint moving</h1>
          <p>Create, filter, and complete work items. Built as a QA candidate exercise app.</p>
        </header>

        <section class="panel">
          <h2 data-cy="form-heading">${this.editingId ? 'Edit task' : 'New task'}</h2>
          <form data-cy="task-form" class="form-grid">
            <label class="full">
              Title
              <input data-cy="task-title-input" name="title" maxlength="120" value="${escapeAttr(this.form.title)}" />
            </label>
            <label class="full">
              Description
              <textarea data-cy="task-description-input" name="description" maxlength="${DESCRIPTION_LIMIT}">${escapeHtml(this.form.description)}</textarea>
              <span class="field-hint" data-cy="description-counter">${this.form.description.length}/${DESCRIPTION_LIMIT}</span>
            </label>
            <label class="full">
              Labels
              <input data-cy="task-labels-input" name="labels" placeholder="Comma-separated, optional" value="${escapeAttr(this.form.labels)}" />
            </label>
            <label>
              Priority
              <select data-cy="task-priority-select" name="priority">
                ${(['Low', 'Medium', 'High'] as Priority[])
                  .map(
                    (priority) =>
                      `<option value="${priority}" ${this.form.priority === priority ? 'selected' : ''}>${priority}</option>`,
                  )
                  .join('')}
              </select>
            </label>
            <label>
              Due date
              <input data-cy="task-due-date-input" type="date" name="dueDate" value="${escapeAttr(this.form.dueDate)}" />
              <span class="field-hint ${this.dueDateError ? 'error' : ''}" data-cy="due-date-error">${this.dueDateError}</span>
            </label>
            <div class="actions full">
              <button class="btn btn-primary" data-cy="task-submit" type="submit">${this.editingId ? 'Save changes' : 'Add task'}</button>
              ${
                this.editingId
                  ? '<button class="btn btn-secondary" data-cy="task-cancel-edit" type="button">Cancel edit</button>'
                  : ''
              }
            </div>
          </form>
        </section>

        <section class="panel">
          <div class="toolbar">
            <div class="filters">
              <label>
                Status
                <select data-cy="status-filter" name="status">
                  <option value="all" ${this.status === 'all' ? 'selected' : ''}>All</option>
                  <option value="active" ${this.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="completed" ${this.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
              </label>
              <label>
                Sort
                <select data-cy="sort-select" name="sort">
                  <option value="created" ${this.sort === 'created' ? 'selected' : ''}>Newest</option>
                  <option value="title" ${this.sort === 'title' ? 'selected' : ''}>Title</option>
                  <option value="priority" ${this.sort === 'priority' ? 'selected' : ''}>Priority</option>
                  <option value="dueDate" ${this.sort === 'dueDate' ? 'selected' : ''}>Due date</option>
                </select>
              </label>
              <label>
                Search
                <input data-cy="search-input" name="search" placeholder="Search title or description" value="${escapeAttr(this.search)}" />
              </label>
            </div>
            <div class="actions">
              <div class="stats" data-cy="task-stats">
                <span><strong data-cy="remaining-count">${this.remainingCount()}</strong> remaining</span>
                <span><strong data-cy="visible-count">${this.tasks.length}</strong> shown</span>
              </div>
              <button class="btn btn-secondary" data-cy="clear-completed" type="button">Clear completed</button>
            </div>
          </div>
        </section>

        <section class="panel">
          <h2>Tasks</h2>
          ${
            this.tasks.length === 0
              ? '<p class="empty" data-cy="empty-state">No tasks match the current filters.</p>'
              : `<ul class="task-list" data-cy="task-list">${this.tasks.map((task) => this.renderTask(task)).join('')}</ul>`
          }
        </section>
      </div>
      <div class="toast" data-cy="toast"></div>
    `;

    this.bindEvents();
  }

  private renderTask(task: Task): string {
    return `
      <li class="task-item ${task.isCompleted ? 'completed' : ''}" data-cy="task-item" data-task-id="${task.id}">
        <input
          type="checkbox"
          data-cy="task-complete-toggle"
          ${task.isCompleted ? 'checked' : ''}
          aria-label="Mark complete"
        />
        <div>
          <h3 class="task-title" data-cy="task-title">${task.title}</h3>
          <p class="task-description" data-cy="task-description">${escapeHtml(task.description)}</p>
          <div class="meta">
            ${renderLabels(task.labels)}
            <span class="chip priority-${task.priority}" data-cy="task-priority">${task.priority}</span>
            <span class="chip" data-cy="task-due-date">${this.formatDueDate(task.dueDate)}</span>
            <span class="chip" data-cy="task-status">${task.isCompleted ? 'Completed' : 'Active'}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-secondary" data-cy="task-edit" type="button">Edit</button>
          <button class="btn btn-danger" data-cy="task-delete" type="button">Delete</button>
        </div>
      </li>
    `;
  }

  private bindEvents(): void {
    const form = this.root.querySelector<HTMLFormElement>('[data-cy="task-form"]');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.submitForm();
    });

    form?.addEventListener('dblclick', (event) => {
      const target = event.target;
      if (
        !this.editingId &&
        target instanceof HTMLElement &&
        target.closest('[data-cy="task-submit"]')
      ) {
        void this.submitForm();
      }
    });

    const titleInput = this.root.querySelector<HTMLInputElement>('[data-cy="task-title-input"]');
    titleInput?.addEventListener('input', () => {
      this.form.title = titleInput.value;
    });

    const descriptionInput = this.root.querySelector<HTMLTextAreaElement>(
      '[data-cy="task-description-input"]',
    );
    descriptionInput?.addEventListener('input', () => {
      this.form.description = descriptionInput.value;
      const counter = this.root.querySelector('[data-cy="description-counter"]');
      if (counter) {
        counter.textContent = `${this.form.description.length}/${DESCRIPTION_LIMIT}`;
      }
    });

    const labelsInput = this.root.querySelector<HTMLInputElement>('[data-cy="task-labels-input"]');
    labelsInput?.addEventListener('input', () => {
      this.form.labels = labelsInput.value;
    });

    const prioritySelect = this.root.querySelector<HTMLSelectElement>(
      '[data-cy="task-priority-select"]',
    );
    prioritySelect?.addEventListener('change', () => {
      this.form.priority = prioritySelect.value as Priority;
    });

    const dueDateInput = this.root.querySelector<HTMLInputElement>('[data-cy="task-due-date-input"]');
    dueDateInput?.addEventListener('change', () => {
      this.form.dueDate = dueDateInput.value;
      this.dueDateError = this.validateDueDate(this.form.dueDate);
      const error = this.root.querySelector('[data-cy="due-date-error"]');
      if (error) {
        error.textContent = this.dueDateError;
        error.classList.toggle('error', Boolean(this.dueDateError));
      }
    });

    this.root.querySelector('[data-cy="task-cancel-edit"]')?.addEventListener('click', () => {
      this.editingId = null;
      this.form = emptyForm();
      this.dueDateError = '';
      this.render();
    });

    const statusFilter = this.root.querySelector<HTMLSelectElement>('[data-cy="status-filter"]');
    statusFilter?.addEventListener('change', () => {
      this.focusSearch = false;
      this.status = statusFilter.value as StatusFilter;
      void this.reload();
    });

    const sortSelect = this.root.querySelector<HTMLSelectElement>('[data-cy="sort-select"]');
    sortSelect?.addEventListener('change', () => {
      this.sort = sortSelect.value as SortOption;
      void this.reload();
    });

    const searchInput = this.root.querySelector<HTMLInputElement>('[data-cy="search-input"]');
    searchInput?.addEventListener('input', () => {
      this.search = searchInput.value;
      this.focusSearch = true;
      void this.reload();
    });

    this.root.querySelector('[data-cy="clear-completed"]')?.addEventListener('click', () => {
      void this.onClearCompleted();
    });

    this.root.querySelectorAll<HTMLElement>('[data-cy="task-item"]').forEach((item) => {
      const rawId = item.dataset.taskId;
      if (!rawId) {
        return;
      }

      const id = Number(rawId);
      if (Number.isNaN(id)) {
        return;
      }

      item.querySelector('[data-cy="task-complete-toggle"]')?.addEventListener('change', () => {
        void this.toggleComplete(id);
      });

      item.querySelector('[data-cy="task-edit"]')?.addEventListener('click', () => {
        this.beginEdit(id);
      });

      item.querySelector('[data-cy="task-delete"]')?.addEventListener('click', () => {
        void this.onDelete(id);
      });
    });

    if (this.focusSearch) {
      const input = this.root.querySelector<HTMLInputElement>('[data-cy="search-input"]');
      input?.focus();
      const cursor = input?.value.length ?? 0;
      input?.setSelectionRange(cursor, cursor);
    }
  }

  private beginEdit(id: number): void {
    const task = this.tasks.find((entry) => entry.id === id);
    if (!task) {
      return;
    }

    this.editingId = id;
    this.form = {
      title: task.title,
      description: task.description,
      labels: task.labels,
      priority: task.priority,
      dueDate: task.dueDate ?? '',
    };
    this.dueDateError = this.validateDueDate(this.form.dueDate);
    this.render();
  }

  private async submitForm(): Promise<void> {
    const title = this.form.title;
    this.dueDateError = this.validateDueDate(this.form.dueDate);
    if (this.dueDateError) {
      this.render();
      return;
    }

    const payload = {
      title,
      description: this.form.description,
      labels: this.form.labels,
      priority: this.form.priority,
      dueDate: this.form.dueDate || null,
    };

    try {
      if (this.editingId) {
        const existing = this.tasks.find((task) => task.id === this.editingId);
        await updateTask(this.editingId, {
          ...payload,
          isCompleted: existing?.isCompleted ?? false,
        });
        this.showToast('Task updated');
      } else {
        await createTask(payload);
        this.showToast('Task created');
      }

      this.editingId = null;
      this.form = emptyForm();
      this.dueDateError = '';
      await this.reload();
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : 'Save failed');
    }
  }

  private async toggleComplete(id: number): Promise<void> {
    try {
      await toggleTask(id);
      await this.reload();
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : 'Could not update task');
      await this.reload();
    }
  }

  private async onDelete(id: number): Promise<void> {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) {
      return;
    }

    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.render();
    this.showToast('Task deleted');
  }

  private async onClearCompleted(): Promise<void> {
    try {
      const result = await clearCompleted();
      this.showToast(`Cleared ${result.removed} task(s)`);
      await this.reload();
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : 'Clear failed');
    }
  }

  private showToast(message: string): void {
    const toast = this.root.querySelector<HTMLElement>('[data-cy="toast"]');
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  }
}

function renderLabels(labels: string): string {
  return labels
    .split(',')
    .filter((label) => label.length > 0)
    .map((label) => `<span class="chip" data-cy="task-label">${escapeHtml(label)}</span>`)
    .join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
