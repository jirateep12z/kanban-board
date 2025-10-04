class TaskManager {
  constructor(database) {
    this.database = database;
    this.tasks = [];
    this.current_filter = 'All';
    this.current_sort = 'created-desc';
    this.current_tag_filter = '';
    this.current_date_filter = 'today';
    this.custom_date = null;
    this.search_keyword = '';
  }

  // Generate a unique ID for a new task
  GenerateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Create a new task
  CreateTask(
    title,
    description,
    status,
    date,
    tags,
    attachments,
    task_priority,
    subtasks,
    comments
  ) {
    return {
      id: this.GenerateId(),
      title: title,
      description: description || '',
      status: status,
      date: date || '',
      tags: tags || [],
      image: '',
      attachments: attachments || [],
      priority: 0,
      task_priority: task_priority || 'medium',
      subtasks: subtasks || [],
      comments: comments || [],
      created_at: new Date().toISOString()
    };
  }

  // Add a new task to the tasks array and save to cookie
  async AddTask(task, board_id = null) {
    this.tasks.push(task);
    await this.database.SaveTasksToCookie(this.tasks, board_id);
  }

  // Update an existing task and save to cookie
  async UpdateTask(id, updates, board_id = null) {
    const task_index = this.tasks.findIndex(t => t.id === id);
    if (task_index !== -1) {
      this.tasks[task_index] = {
        ...this.tasks[task_index],
        ...updates
      };
      await this.database.SaveTasksToCookie(this.tasks, board_id);
    }
  }

  // Delete a task and its attachments from the tasks array and save to cookie
  async DeleteTask(id, board_id = null) {
    await this.database.DeleteAttachmentsFromDB(id);
    this.tasks = this.tasks.filter(t => t.id !== id);
    await this.database.SaveTasksToCookie(this.tasks, board_id);
  }

  // Move a task to a new status and save to cookie
  async MoveTask(id, new_status) {
    await this.UpdateTask(id, { status: new_status });
  }

  // Reorder tasks in a column and save to cookie
  async ReorderTasksInColumn(
    dragging_id,
    target_id,
    position,
    board_id = null
  ) {
    const dragging_task = this.tasks.find(t => t.id === dragging_id);
    const target_task = this.tasks.find(t => t.id === target_id);
    if (!dragging_task || !target_task) return;
    const column_tasks = this.tasks
      .filter(t => t.status === dragging_task.status)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const filtered_tasks = column_tasks.filter(t => t.id !== dragging_id);
    const target_index = filtered_tasks.findIndex(t => t.id === target_id);
    const insert_index =
      position === 'before' ? target_index : target_index + 1;
    filtered_tasks.splice(insert_index, 0, dragging_task);
    filtered_tasks.forEach((task, index) => {
      task.priority = index;
    });
    await this.database.SaveTasksToCookie(this.tasks, board_id);
  }

  // Get filtered tasks based on current filter, tag filter, date filter, search keyword, and sort
  GetFilteredTasks() {
    let filtered = this.tasks;
    if (this.current_filter !== 'All') {
      filtered = filtered.filter(t => t.status === this.current_filter);
    }
    if (this.current_tag_filter) {
      filtered = filtered.filter(t => {
        if (t.tags && Array.isArray(t.tags)) {
          return t.tags.some(tag => tag.name === this.current_tag_filter);
        } else if (t.tag) {
          return t.tag === this.current_tag_filter;
        }
        return false;
      });
    }
    if (this.current_date_filter && this.current_date_filter !== 'all') {
      filtered = this.FilterByDateRange(filtered, this.current_date_filter);
    }
    if (this.search_keyword && this.search_keyword.trim() !== '') {
      const keyword = this.search_keyword.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const title_match = t.title?.toLowerCase().includes(keyword);
        const description_match = t.description
          ?.toLowerCase()
          .includes(keyword);
        const tags_match = t.tags?.some(tag =>
          tag.name?.toLowerCase().includes(keyword)
        );
        return title_match || description_match || tags_match;
      });
    }
    return this.SortTasks(filtered, this.current_sort);
  }

  // Filter tasks by date range
  FilterByDateRange(tasks, range) {
    const now = new Date();
    const today_start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const today_end = new Date(today_start);
    today_end.setDate(today_end.getDate() + 1);
    return tasks.filter(task => {
      if (!task.date) return false;
      const task_date = new Date(task.date);
      switch (range) {
        case 'today': {
          return task_date >= today_start && task_date < today_end;
        }
        case 'yesterday': {
          const yesterday_start = new Date(today_start);
          yesterday_start.setDate(yesterday_start.getDate() - 1);
          const yesterday_end = new Date(today_start);
          return task_date >= yesterday_start && task_date < yesterday_end;
        }
        case 'this-week': {
          const week_start = new Date(today_start);
          const day_of_week = week_start.getDay();
          const diff = day_of_week === 0 ? 6 : day_of_week - 1;
          week_start.setDate(week_start.getDate() - diff);
          const week_end = new Date(week_start);
          week_end.setDate(week_end.getDate() + 7);
          return task_date >= week_start && task_date < week_end;
        }
        case 'this-month': {
          const month_start = new Date(now.getFullYear(), now.getMonth(), 1);
          const month_end = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59
          );
          return task_date >= month_start && task_date <= month_end;
        }
        case 'this-year': {
          const year_start = new Date(now.getFullYear(), 0, 1);
          const year_end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          return task_date >= year_start && task_date <= year_end;
        }
        case 'custom': {
          if (!this.custom_date) return false;
          const custom_start = new Date(this.custom_date);
          const custom_end = new Date(custom_start);
          custom_end.setDate(custom_end.getDate() + 1);
          return task_date >= custom_start && task_date < custom_end;
        }
        default:
          return true;
      }
    });
  }

  // Sort tasks based on sort_by parameter
  SortTasks(tasks, sort_by) {
    const sorted = [...tasks];
    switch (sort_by) {
      case 'created-desc':
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case 'created-asc':
        return sorted.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-asc':
        return sorted.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        });
      case 'date-desc':
        return sorted.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date) - new Date(a.date);
        });
      case 'priority':
        return sorted.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      default:
        return sorted;
    }
  }

  // Get a task by its ID
  GetTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }

  // Get tasks by status
  GetTasksByStatus(status) {
    return this.tasks.filter(t => t.status === status);
  }

  // Get unique tags from tasks
  GetUniqueTags() {
    const all_tags = [];
    this.tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          if (!all_tags.includes(tag.name)) {
            all_tags.push(tag.name);
          }
        });
      } else if (task.tag) {
        if (!all_tags.includes(task.tag)) {
          all_tags.push(task.tag);
        }
      }
    });
    return all_tags.sort();
  }

  // Get task counts based on current filter, tag filter, and date filter
  GetTaskCounts() {
    let filtered_tasks = this.tasks;
    if (this.current_date_filter && this.current_date_filter !== 'all') {
      filtered_tasks = this.FilterByDateRange(
        filtered_tasks,
        this.current_date_filter
      );
    }
    return {
      all: filtered_tasks.length,
      todo: filtered_tasks.filter(t => t.status === 'Todo').length,
      inprogress: filtered_tasks.filter(t => t.status === 'InProgress').length,
      completed: filtered_tasks.filter(t => t.status === 'Completed').length
    };
  }

  // Load tasks from cookie
  async LoadTasks(board_id = null) {
    this.tasks = await this.database.LoadTasksFromStorage(board_id);
  }

  // Compress data for export
  CompressData(data) {
    try {
      const json_string = JSON.stringify(data);
      return btoa(unescape(encodeURIComponent(json_string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      console.error('Error compressing data:', e);
      return null;
    }
  }

  // Decompress data for import
  DecompressData(compressed) {
    try {
      const base64 = compressed.replace(/-/g, '+').replace(/_/g, '');
      const padded = base64 + '=='.substring(0, (4 - (base64.length % 4)) % 4);
      const json_string = decodeURIComponent(escape(atob(padded)));
      return JSON.parse(json_string);
    } catch (e) {
      console.error('Error decompressing data:', e);
      return null;
    }
  }

  // Export tasks to base64
  ExportTasksToBase64() {
    try {
      const minimal_tasks = this.tasks.map(task => {
        const minimal = {
          i: task.id,
          t: task.title,
          s: task.status
        };
        if (task.description) minimal.d = task.description;
        if (task.date) minimal.dt = task.date;
        if (task.tags && task.tags.length > 0) {
          minimal.tgs = task.tags;
        } else if (task.tag) {
          minimal.tg = task.tag;
          minimal.tc = task.tag_color;
        }
        if (task.priority) minimal.p = task.priority;
        return minimal;
      });
      return this.CompressData(minimal_tasks);
    } catch (e) {
      console.error('Error exporting tasks:', e);
      return null;
    }
  }

  // Import tasks from base64
  ImportTasksFromBase64(base64_data) {
    try {
      const minimal_tasks = this.DecompressData(base64_data);
      if (!minimal_tasks) return null;
      return minimal_tasks.map(mt => {
        const task = {
          id: mt.i,
          title: mt.t,
          description: mt.d || '',
          status: mt.s,
          date: mt.dt || '',
          image: '',
          attachments: [],
          priority: mt.p || 0,
          created_at: new Date().toISOString()
        };
        if (mt.tgs && Array.isArray(mt.tgs)) {
          task.tags = mt.tgs;
        } else if (mt.tg) {
          task.tags = [{ name: mt.tg, color: mt.tc || 'blue' }];
        } else {
          task.tags = [];
        }
        return task;
      });
    } catch (e) {
      console.error('Error importing tasks:', e);
      return null;
    }
  }

  // Generate share URL
  GenerateShareURL() {
    const base64_data = this.ExportTasksToBase64();
    if (!base64_data) return null;
    const base_url = window.location.origin + window.location.pathname;
    return `${base_url}?share=${base64_data}`;
  }
}
