class TemplateManager {
  constructor(database) {
    this.database = database;
    this.templates = [];
    this.TEMPLATES_COOKIE_NAME = 'kanban_templates';
  }

  // Generate unique template ID
  GenerateTemplateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Create template from task
  CreateTemplate(name, task_data) {
    return {
      id: this.GenerateTemplateId(),
      name: name,
      description: task_data.description || '',
      tags: task_data.tags || [],
      task_priority: task_data.task_priority || 'medium',
      subtasks: task_data.subtasks || [],
      created_at: new Date().toISOString()
    };
  }

  // Add template
  async AddTemplate(template) {
    this.templates.push(template);
    await this.SaveTemplates();
    return template;
  }

  // Update template
  async UpdateTemplate(template_id, updates) {
    const template_index = this.templates.findIndex(t => t.id === template_id);
    if (template_index !== -1) {
      this.templates[template_index] = {
        ...this.templates[template_index],
        ...updates
      };
      await this.SaveTemplates();
      return this.templates[template_index];
    }
    return null;
  }

  // Delete template
  async DeleteTemplate(template_id) {
    this.templates = this.templates.filter(t => t.id !== template_id);
    await this.SaveTemplates();
  }

  // Get template by ID
  GetTemplateById(template_id) {
    return this.templates.find(t => t.id === template_id);
  }

  // Get all templates
  GetAllTemplates() {
    return this.templates.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  // Apply template to create task
  ApplyTemplate(template_id, title, status = 'Todo', date = '') {
    const template = this.GetTemplateById(template_id);
    if (!template) return null;
    return {
      title: title,
      description: template.description,
      status: status,
      date: date,
      tags: [...template.tags],
      task_priority: template.task_priority,
      subtasks: template.subtasks.map(st => ({
        ...st,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2)
      })),
      attachments: [],
      comments: []
    };
  }

  // Save templates to cookie
  async SaveTemplates() {
    try {
      const templates_json = JSON.stringify(this.templates);
      this.database.SetCookie(
        this.TEMPLATES_COOKIE_NAME,
        templates_json,
        this.database.COOKIE_EXPIRY_DAYS
      );
    } catch (e) {
      console.error('Error saving templates:', e);
      throw e;
    }
  }

  // Load templates from cookie
  async LoadTemplates() {
    try {
      const templates_json = this.database.GetCookie(
        this.TEMPLATES_COOKIE_NAME
      );
      if (!templates_json) {
        this.templates = [];
        return this.templates;
      }
      this.templates = JSON.parse(templates_json);
      return this.templates;
    } catch (e) {
      console.error('Error loading templates:', e);
      return [];
    }
  }
}
