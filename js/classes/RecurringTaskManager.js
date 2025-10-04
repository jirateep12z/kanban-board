class RecurringTaskManager {
  constructor(database, task_manager) {
    this.database = database;
    this.task_manager = task_manager;
    this.recurring_tasks = [];
    this.RECURRING_COOKIE_NAME = 'kanban_recurring_tasks';
  }

  // Generate unique recurring task ID
  GenerateRecurringId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Create recurring task
  CreateRecurringTask(task_data, recurrence_pattern) {
    return {
      id: this.GenerateRecurringId(),
      task_template: {
        title: task_data.title,
        description: task_data.description || '',
        status: task_data.status || 'Todo',
        tags: task_data.tags || [],
        task_priority: task_data.task_priority || 'medium',
        subtasks: task_data.subtasks || []
      },
      recurrence: {
        type: recurrence_pattern.type,
        interval: recurrence_pattern.interval || 1,
        days_of_week: recurrence_pattern.days_of_week || [],
        day_of_month: recurrence_pattern.day_of_month || null,
        end_date: recurrence_pattern.end_date || null
      },
      last_created: null,
      next_due: this.CalculateNextDue(recurrence_pattern, new Date()),
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  // Calculate next due date
  CalculateNextDue(recurrence, from_date) {
    const next_date = new Date(from_date);
    switch (recurrence.type) {
      case 'daily':
        next_date.setDate(next_date.getDate() + recurrence.interval);
        break;
      case 'weekly':
        next_date.setDate(next_date.getDate() + 7 * recurrence.interval);
        break;
      case 'monthly':
        next_date.setMonth(next_date.getMonth() + recurrence.interval);
        if (recurrence.day_of_month) {
          next_date.setDate(recurrence.day_of_month);
        }
        break;
      case 'yearly':
        next_date.setFullYear(next_date.getFullYear() + recurrence.interval);
        break;
    }
    return next_date.toISOString();
  }

  // Add recurring task
  async AddRecurringTask(recurring_task) {
    this.recurring_tasks.push(recurring_task);
    await this.SaveRecurringTasks();
    return recurring_task;
  }

  // Update recurring task
  async UpdateRecurringTask(recurring_id, updates) {
    const index = this.recurring_tasks.findIndex(rt => rt.id === recurring_id);
    if (index !== -1) {
      this.recurring_tasks[index] = {
        ...this.recurring_tasks[index],
        ...updates
      };
      await this.SaveRecurringTasks();
      return this.recurring_tasks[index];
    }
    return null;
  }

  // Delete recurring task
  async DeleteRecurringTask(recurring_id) {
    this.recurring_tasks = this.recurring_tasks.filter(
      rt => rt.id !== recurring_id
    );
    await this.SaveRecurringTasks();
  }

  // Toggle recurring task active status
  async ToggleRecurringTask(recurring_id) {
    const recurring_task = this.recurring_tasks.find(
      rt => rt.id === recurring_id
    );
    if (recurring_task) {
      recurring_task.is_active = !recurring_task.is_active;
      await this.SaveRecurringTasks();
      return recurring_task;
    }
    return null;
  }

  // Get all recurring tasks
  GetAllRecurringTasks() {
    return this.recurring_tasks.sort(
      (a, b) => new Date(a.next_due) - new Date(b.next_due)
    );
  }

  // Check and create due tasks
  async CheckAndCreateDueTasks() {
    const now = new Date();
    const created_tasks = [];
    for (const recurring_task of this.recurring_tasks) {
      if (!recurring_task.is_active) continue;
      const next_due = new Date(recurring_task.next_due);
      if (recurring_task.recurrence.end_date) {
        const end_date = new Date(recurring_task.recurrence.end_date);
        if (now > end_date) {
          recurring_task.is_active = false;
          continue;
        }
      }
      if (now >= next_due) {
        const new_task = this.task_manager.CreateTask(
          recurring_task.task_template.title,
          recurring_task.task_template.description,
          recurring_task.task_template.status,
          next_due.toISOString().split('T')[0],
          recurring_task.task_template.tags,
          [],
          recurring_task.task_template.task_priority,
          recurring_task.task_template.subtasks.map(st => ({ ...st })),
          []
        );
        await this.task_manager.AddTask(new_task);
        created_tasks.push(new_task);
        recurring_task.last_created = now.toISOString();
        recurring_task.next_due = this.CalculateNextDue(
          recurring_task.recurrence,
          next_due
        );
      }
    }
    if (created_tasks.length > 0) {
      await this.SaveRecurringTasks();
    }
    return created_tasks;
  }

  // Save recurring tasks to cookie
  async SaveRecurringTasks() {
    try {
      const recurring_json = JSON.stringify(this.recurring_tasks);
      this.database.SetCookie(
        this.RECURRING_COOKIE_NAME,
        recurring_json,
        this.database.COOKIE_EXPIRY_DAYS
      );
    } catch (e) {
      console.error('Error saving recurring tasks:', e);
      throw e;
    }
  }

  // Load recurring tasks from cookie
  async LoadRecurringTasks() {
    try {
      const recurring_json = this.database.GetCookie(
        this.RECURRING_COOKIE_NAME
      );
      if (!recurring_json) {
        this.recurring_tasks = [];
        return this.recurring_tasks;
      }
      this.recurring_tasks = JSON.parse(recurring_json);
      return this.recurring_tasks;
    } catch (e) {
      console.error('Error loading recurring tasks:', e);
      return [];
    }
  }
}
