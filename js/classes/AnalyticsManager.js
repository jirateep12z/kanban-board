class AnalyticsManager {
  constructor(task_manager) {
    this.task_manager = task_manager;
  }

  // Get task statistics
  GetTaskStatistics() {
    const tasks = this.task_manager.tasks;
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'Todo').length,
      in_progress: tasks.filter(t => t.status === 'InProgress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      high_priority: tasks.filter(t => t.task_priority === 'high').length,
      medium_priority: tasks.filter(t => t.task_priority === 'medium').length,
      low_priority: tasks.filter(t => t.task_priority === 'low').length,
      with_due_date: tasks.filter(t => t.date).length,
      overdue: this.GetOverdueTasks().length,
      with_attachments: tasks.filter(
        t => t.attachments && t.attachments.length > 0
      ).length,
      with_subtasks: tasks.filter(t => t.subtasks && t.subtasks.length > 0)
        .length,
      with_comments: tasks.filter(t => t.comments && t.comments.length > 0)
        .length
    };
  }

  // Get overdue tasks
  GetOverdueTasks() {
    const now = new Date();
    return this.task_manager.tasks.filter(task => {
      if (!task.date || task.status === 'Completed') return false;
      const due_date = new Date(task.date);
      return due_date < now;
    });
  }

  // Get completion rate
  GetCompletionRate() {
    const total = this.task_manager.tasks.length;
    if (total === 0) return 0;
    const completed = this.task_manager.tasks.filter(
      t => t.status === 'Completed'
    ).length;
    return Math.round((completed / total) * 100);
  }

  // Get tasks by date range
  GetTasksByDateRange(start_date, end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    return this.task_manager.tasks.filter(task => {
      const created = new Date(task.created_at);
      return created >= start && created <= end;
    });
  }

  // Get tasks created per day (last 7 days)
  GetTasksCreatedPerDay(days = 7) {
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next_date = new Date(date);
      next_date.setDate(next_date.getDate() + 1);
      const count = this.task_manager.tasks.filter(task => {
        const created = new Date(task.created_at);
        return created >= date && created < next_date;
      }).length;
      result.push({
        date: date.toISOString().split('T')[0],
        count: count
      });
    }
    return result;
  }

  // Get tasks completed per day (last 7 days)
  GetTasksCompletedPerDay(days = 7) {
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next_date = new Date(date);
      next_date.setDate(next_date.getDate() + 1);
      const count = this.task_manager.tasks.filter(task => {
        if (task.status !== 'Completed') return false;
        const created = new Date(task.created_at);
        return created >= date && created < next_date;
      }).length;
      result.push({
        date: date.toISOString().split('T')[0],
        count: count
      });
    }
    return result;
  }

  // Get tasks by priority distribution
  GetPriorityDistribution() {
    const tasks = this.task_manager.tasks;
    const total = tasks.length;
    if (total === 0) {
      return { high: 0, medium: 0, low: 0 };
    }
    return {
      high: Math.round(
        (tasks.filter(t => t.task_priority === 'high').length / total) * 100
      ),
      medium: Math.round(
        (tasks.filter(t => t.task_priority === 'medium').length / total) * 100
      ),
      low: Math.round(
        (tasks.filter(t => t.task_priority === 'low').length / total) * 100
      )
    };
  }

  // Get tasks by status distribution
  GetStatusDistribution() {
    const tasks = this.task_manager.tasks;
    const total = tasks.length;
    if (total === 0) {
      return { todo: 0, in_progress: 0, completed: 0 };
    }
    return {
      todo: Math.round(
        (tasks.filter(t => t.status === 'Todo').length / total) * 100
      ),
      in_progress: Math.round(
        (tasks.filter(t => t.status === 'InProgress').length / total) * 100
      ),
      completed: Math.round(
        (tasks.filter(t => t.status === 'Completed').length / total) * 100
      )
    };
  }

  // Get average completion time (in days)
  GetAverageCompletionTime() {
    const completed_tasks = this.task_manager.tasks.filter(
      t => t.status === 'Completed'
    );
    if (completed_tasks.length === 0) return 0;
    const total_days = completed_tasks.reduce((sum, task) => {
      const created = new Date(task.created_at);
      const now = new Date();
      const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    return Math.round(total_days / completed_tasks.length);
  }

  // Get most used tags
  GetMostUsedTags(limit = 5) {
    const tag_counts = {};
    this.task_manager.tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          tag_counts[tag.name] = (tag_counts[tag.name] || 0) + 1;
        });
      }
    });
    return Object.entries(tag_counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  // Get productivity score (0-100)
  GetProductivityScore() {
    const stats = this.GetTaskStatistics();
    const completion_rate = this.GetCompletionRate();
    let score = 0;
    score += completion_rate * 0.4;
    if (stats.total > 0) {
      score += (stats.with_due_date / stats.total) * 100 * 0.2;
    }
    if (stats.total > 0) {
      score += ((stats.total - stats.overdue) / stats.total) * 100 * 0.2;
    }
    if (stats.total > 0) {
      score += (stats.with_subtasks / stats.total) * 100 * 0.1;
    }
    if (stats.total > 0) {
      score += (stats.in_progress / stats.total) * 100 * 0.1;
    }
    return Math.min(100, Math.round(score));
  }

  // Get weekly summary
  GetWeeklySummary() {
    const now = new Date();
    const week_ago = new Date(now);
    week_ago.setDate(week_ago.getDate() - 7);
    const tasks_this_week = this.GetTasksByDateRange(week_ago, now);
    const completed_this_week = tasks_this_week.filter(
      t => t.status === 'Completed'
    );
    return {
      tasks_created: tasks_this_week.length,
      tasks_completed: completed_this_week.length,
      completion_rate:
        tasks_this_week.length > 0
          ? Math.round(
              (completed_this_week.length / tasks_this_week.length) * 100
            )
          : 0,
      productivity_score: this.GetProductivityScore()
    };
  }
}
