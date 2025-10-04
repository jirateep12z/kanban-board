class UIManager {
  constructor(task_manager, board_manager = null) {
    this.task_manager = task_manager;
    this.board_manager = board_manager;
    this.editing_task_id = null;
    this.current_image_base64 = null;
    this.current_attachments = [];
    this.current_tags = [];
    this.current_subtasks = [];
    this.current_comments = [];
    this.mde = null;
    this.TAG_COLORS = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-500/15',
        text: 'text-blue-600 dark:text-blue-400',
        hex: '#3b82f6'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-500/15',
        text: 'text-green-600 dark:text-green-400',
        hex: '#22c55e'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-500/15',
        text: 'text-red-600 dark:text-red-400',
        hex: '#ef4444'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-500/15',
        text: 'text-yellow-600 dark:text-yellow-400',
        hex: '#eab308'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-500/15',
        text: 'text-purple-600 dark:text-purple-400',
        hex: '#a855f7'
      },
      pink: {
        bg: 'bg-pink-50 dark:bg-pink-500/15',
        text: 'text-pink-600 dark:text-pink-400',
        hex: '#ec4899'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-500/15',
        text: 'text-orange-600 dark:text-orange-400',
        hex: '#f97316'
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-white/[0.03]',
        text: 'text-gray-700 dark:text-white/80',
        hex: '#6b7280'
      }
    };
  }

  // Initialize markdown editor
  InitMarkdownEditor() {
    const t = key =>
      this.i18n_manager ? this.i18n_manager.Translate(key) : key;
    this.mde = new EasyMDE({
      element: document.getElementById('task-description'),
      placeholder: t('task_modal.task_description_placeholder'),
      spellChecker: false,
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide'
      ],
      minHeight: '150px',
      maxHeight: '300px'
    });
  }

  // Render tasks in lanes
  RenderTasks() {
    document.getElementById('lane-todo').innerHTML = '';
    document.getElementById('lane-inprogress').innerHTML = '';
    document.getElementById('lane-completed').innerHTML = '';
    const filtered_tasks = this.task_manager.GetFilteredTasks();
    const grouped_tasks = {
      Todo: [],
      InProgress: [],
      Completed: []
    };
    filtered_tasks.forEach(task => {
      if (grouped_tasks[task.status]) {
        grouped_tasks[task.status].push(task);
      }
    });
    Object.keys(grouped_tasks).forEach(status => {
      grouped_tasks[status].sort(
        (a, b) => (a.priority || 0) - (b.priority || 0)
      );
    });
    Object.keys(grouped_tasks).forEach(status => {
      const lane_id = `lane-${status.toLowerCase()}`;
      const lane = document.getElementById(lane_id);
      if (lane) {
        grouped_tasks[status].forEach(task => {
          lane.innerHTML += this.RenderTaskCard(task);
        });
      }
    });
    this.UpdateCounts();
    this.UpdateTagFilterOptions();
  }

  // Render task card
  RenderTaskCard(task) {
    const formatted_date = this.FormatDate(task.date);
    let priority_badge = '';
    const task_priority = task.task_priority || 'medium';
    const priority_config = {
      high: {
        bg: 'bg-red-50 dark:bg-red-500/15',
        text: 'text-red-600 dark:text-red-400',
        icon: '🔴',
        label: 'High'
      },
      medium: {
        bg: 'bg-yellow-50 dark:bg-yellow-500/15',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: '🟡',
        label: 'Medium'
      },
      low: {
        bg: 'bg-green-50 dark:bg-green-500/15',
        text: 'text-green-600 dark:text-green-400',
        icon: '🟢',
        label: 'Low'
      }
    };
    const priority_style =
      priority_config[task_priority] || priority_config.medium;
    priority_badge = `<span class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${priority_style.bg} ${priority_style.text}">${priority_style.icon} ${priority_style.label}</span>`;
    let subtasks_info = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const completed_count = task.subtasks.filter(st => st.completed).length;
      const total_count = task.subtasks.length;
      const percentage = Math.round((completed_count / total_count) * 100);
      const all_completed = completed_count === total_count;
      const visible_subtasks = task.subtasks.slice(0, 2);
      const remaining_count = total_count - 2;
      let subtasks_list = '';
      visible_subtasks.forEach(st => {
        const checked_attr = st.completed ? 'checked' : '';
        const text_style = st.completed
          ? 'line-through text-gray-400 dark:text-gray-500'
          : 'text-gray-600 dark:text-gray-300';
        subtasks_list += `
          <label class="flex items-start gap-2 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded px-1.5 py-1 -mx-1 transition-colors">
            <span class="custom-checkbox custom-checkbox-sm mt-0.5">
              <input 
                type="checkbox" 
                ${checked_attr}
                onchange="ui_manager.ToggleSubtaskInCard('${task.id}', '${st.id}')"
                onclick="event.stopPropagation()"
              />
              <span class="custom-checkbox-box">
                <svg class="custom-checkbox-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
            </span>
            <span class="text-xs ${text_style} flex-1 leading-tight select-none">${this.EscapeHtml(st.text)}</span>
          </label>
        `;
      });
      subtasks_info = `
        <div class="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              <span class="text-xs font-medium ${all_completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}">
                Subtasks ${completed_count}/${total_count}
              </span>
            </div>
            <span class="text-xs font-semibold ${all_completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}">${percentage}%</span>
          </div>
          <div class="mb-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full ${all_completed ? 'bg-green-500' : 'bg-brand-500'} transition-all duration-300" style="width: ${percentage}%"></div>
          </div>
          <div class="space-y-1.5">
            ${subtasks_list}
            ${remaining_count > 0 ? `<div class="text-xs text-gray-500 dark:text-gray-400 pl-5">+${remaining_count} more...</div>` : ''}
          </div>
        </div>
      `;
    }
    let comments_section = '';
    if (task.comments && task.comments.length > 0) {
      const latest_comment = task.comments[task.comments.length - 1];
      const comment_date = new Date(latest_comment.timestamp);
      const formatted_time = comment_date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const remaining_comments = task.comments.length - 1;
      comments_section = `
        <div class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-800 dark:bg-blue-900/20">
          <div class="mb-1.5 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                ${task.comments.length} Comment${task.comments.length > 1 ? 's' : ''}
              </span>
            </div>
            <span class="text-xs text-blue-500 dark:text-blue-400">${formatted_time}</span>
          </div>
          <p class="text-xs text-blue-700 dark:text-blue-300 line-clamp-2">${this.EscapeHtml(latest_comment.text)}</p>
          ${remaining_comments > 0 ? `<button onclick="ui_manager.ShowCommentsModal('${task.id}')" class="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">View all ${task.comments.length} comments →</button>` : ''}
        </div>
      `;
    }
    let tags_html = '';
    if (task.tags && Array.isArray(task.tags) && task.tags.length > 0) {
      tags_html = '<div class="mt-3 flex flex-wrap gap-1.5">';
      task.tags.forEach(tag => {
        const color_classes =
          this.TAG_COLORS[tag.color] || this.TAG_COLORS.blue;
        tags_html += `<span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
          color_classes.bg
        } ${color_classes.text}">${this.EscapeHtml(tag.name)}</span>`;
      });
      tags_html += '</div>';
    } else if (task.tag) {
      const tag_color_class = this.GetTagColorClass(task.tag_color || 'blue');
      tags_html = `<span class="mt-3 inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tag_color_class}">${this.EscapeHtml(
        task.tag
      )}</span>`;
    }
    const attachments = task.attachments || [];
    const images = attachments.filter(att => att.type === 'image');
    const files = attachments.filter(att => att.type !== 'image');
    let attachments_html = '';
    if (images.length > 0) {
      attachments_html += '<div class="my-3 grid grid-cols-2 gap-2">';
      images.forEach((img, index) => {
        attachments_html += `
          <div class="relative group cursor-pointer" onclick="ui_manager.OpenImageViewer('${task.id}', ${index})">
            <img src="${img.data}" alt="${img.name}" class="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
              <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
              </svg>
            </div>
          </div>
        `;
      });
      attachments_html += '</div>';
    }
    if (files.length > 0) {
      attachments_html += '<div class="my-2 space-y-1">';
      files.forEach(file => {
        const size_text = this.FormatFileSize(file.size);
        const actual_index = attachments.findIndex(att => att.id === file.id);
        attachments_html += `
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <button onclick="ui_manager.PreviewAttachment('${task.id}', ${actual_index})" class="flex items-center gap-2 cursor-pointer hover:text-brand-500 dark:hover:text-brand-400 transition-colors" title="Preview">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span class="truncate">${file.name}</span>
              <span class="text-gray-400">(${size_text})</span>
            </button>
            <button onclick="ui_manager.DownloadAttachment('${task.id}', ${actual_index})" class="hover:text-brand-500 dark:hover:text-brand-400 transition-colors" title="Download">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </button>
          </div>
        `;
      });
      attachments_html += '</div>';
    }
    const image_html = task.image
      ? `<div class="my-3 select-none"><img src="${task.image}" alt="Task image" class="w-full rounded-lg border border-gray-200 dark:border-gray-700" /></div>`
      : '';
    const description_html = task.description
      ? `<div class="mb-3 text-sm text-gray-500 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none">${marked.parse(
          task.description
        )}</div>`
      : '';
    const is_readonly =
      typeof is_readonly_mode !== 'undefined' && is_readonly_mode;
    const draggable_attr = is_readonly ? 'false' : 'true';
    const cursor_class = is_readonly ? 'cursor-default' : 'cursor-move';
    const read_mode_class = is_readonly ? 'read-mode' : '';
    const drag_handlers = is_readonly
      ? ''
      : `ondragstart="drag_drop_manager.HandleDragStart(event, '${task.id}')"
         ondragend="drag_drop_manager.HandleDragEnd(event)"
         ondragover="drag_drop_manager.HandleTaskDragOver(event, '${task.id}')"
         ondrop="drag_drop_manager.HandleTaskDrop(event, '${task.id}')"`;
    const action_buttons = is_readonly
      ? ''
      : `
          <div class="relative">
            <div class="absolute top-0 right-0 flex gap-2">
              <button onclick="ui_manager.OpenTaskModal('${task.id}')" class="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button onclick="if(confirm('Delete this task?')) ui_manager.DeleteTask('${task.id}')" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
    return `
      <div draggable="${draggable_attr}" 
           class="task rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-white/5 ${cursor_class} ${read_mode_class}"
           data-task-id="${task.id}"
           ${drag_handlers}>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="mb-2 flex items-center gap-2">
              ${priority_badge}
            </div>
            <h4 class="mb-3 text-base text-gray-800 dark:text-white/90 font-medium">
              ${task.title}
            </h4>
            ${description_html}
            ${image_html}
            ${attachments_html}
            ${subtasks_info}
            ${comments_section}
            ${
              formatted_date
                ? `
            <div class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2 mt-3">
              <svg class="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.33329 1.0835C5.74751 1.0835 6.08329 1.41928 6.08329 1.8335V2.25016L9.91663 2.25016V1.8335C9.91663 1.41928 10.2524 1.0835 10.6666 1.0835C11.0808 1.0835 11.4166 1.41928 11.4166 1.8335V2.25016L12.3333 2.25016C13.2998 2.25016 14.0833 3.03366 14.0833 4.00016V6.00016L14.0833 12.6668C14.0833 13.6333 13.2998 14.4168 12.3333 14.4168L3.66663 14.4168C2.70013 14.4168 1.91663 13.6333 1.91663 12.6668L1.91663 6.00016L1.91663 4.00016C1.91663 3.03366 2.70013 2.25016 3.66663 2.25016L4.58329 2.25016V1.8335C4.58329 1.41928 4.91908 1.0835 5.33329 1.0835ZM5.33329 3.75016L3.66663 3.75016C3.52855 3.75016 3.41663 3.86209 3.41663 4.00016V5.25016L12.5833 5.25016V4.00016C12.5833 3.86209 12.4714 3.75016 12.3333 3.75016L10.6666 3.75016L5.33329 3.75016ZM12.5833 6.75016L3.41663 6.75016L3.41663 12.6668C3.41663 12.8049 3.52855 12.9168 3.66663 12.9168L12.3333 12.9168C12.4714 12.9168 12.5833 12.8049 12.5833 12.6668L12.5833 6.75016Z" fill=""></path>
              </svg>
              ${formatted_date}
            </div>`
                : ''
            }
            ${tags_html}
            ${
              is_readonly
                ? ''
                : `
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 items-center">
              <button onclick="SaveTaskAsTemplate('${task.id}')" class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" title="Save as Template">
                📋 ${this.i18n_manager.Translate('templates.title')}
              </button>
              <button onclick="CreateRecurringTaskFromCurrent('${task.id}')" class="text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300" title="Make Recurring">
                🔁 ${this.i18n_manager.Translate('recurring.title')}
              </button>
            </div>
            `
            }
          </div>
          ${action_buttons}
        </div>
      </div>
    `;
  }

  // Get tag color class
  GetTagColorClass(color) {
    const colors = this.TAG_COLORS[color] || this.TAG_COLORS['gray'];
    return `${colors.bg} ${colors.text}`;
  }

  // Escape HTML
  EscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Update counts
  UpdateCounts() {
    const counts = this.task_manager.GetTaskCounts();
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-todo').textContent = counts.todo;
    document.getElementById('count-inprogress').textContent = counts.inprogress;
    document.getElementById('count-completed').textContent = counts.completed;
    document.getElementById('lane-count-todo').textContent = counts.todo;
    document.getElementById('lane-count-inprogress').textContent =
      counts.inprogress;
    document.getElementById('lane-count-completed').textContent =
      counts.completed;
  }

  // Update tag filter options
  UpdateTagFilterOptions() {
    const tag_filter = document.getElementById('filter-tag');
    const unique_tags = this.task_manager.GetUniqueTags();
    tag_filter.innerHTML = '<option value="">All Tags</option>';
    unique_tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      if (tag === this.task_manager.current_tag_filter) {
        option.selected = true;
      }
      tag_filter.appendChild(option);
    });
  }

  // Add tag
  AddTag() {
    const tag_input = document.getElementById('task-tag-input');
    const tag_color_select = document.getElementById('task-tag-color');
    const tag_name = tag_input.value.trim();
    const tag_color = tag_color_select.value;
    if (!tag_name) return;
    const exists = this.current_tags.some(
      t => t.name.toLowerCase() === tag_name.toLowerCase()
    );
    if (exists) {
      alert('Tag already exists!');
      return;
    }
    this.current_tags.push({ name: tag_name, color: tag_color });
    this.RenderTagsInModal();
    tag_input.value = '';
    tag_input.focus();
  }

  // Remove tag
  RemoveTag(index) {
    this.current_tags.splice(index, 1);
    this.RenderTagsInModal();
  }

  // Render tags in modal
  RenderTagsInModal() {
    const t = key =>
      this.i18n_manager ? this.i18n_manager.Translate(key) : key;
    const container = document.getElementById('tags-container');
    if (!container) return;
    if (this.current_tags.length === 0) {
      container.innerHTML = `<span class="text-sm text-gray-400 dark:text-gray-500">${t('task_modal.no_tags')}</span>`;
      return;
    }
    container.innerHTML = this.current_tags
      .map((tag, index) => {
        const color_classes =
          this.TAG_COLORS[tag.color] || this.TAG_COLORS.blue;
        return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
          color_classes.bg
        } ${color_classes.text}">
          ${this.EscapeHtml(tag.name)}
          <button 
            type="button"
            onclick="ui_manager.RemoveTag(${index})"
            class="hover:opacity-70 transition-opacity"
            title="Remove tag"
          >
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>
      `;
      })
      .join('');
  }

  // Open task modal
  OpenTaskModal(task_id = null) {
    const t = key =>
      this.i18n_manager ? this.i18n_manager.Translate(key) : key;
    const modal = document.getElementById('task-modal');
    const modal_title = document.getElementById('modal-title');
    const modal_description = document.getElementById('modal-description');
    const submit_text = document.getElementById('submit-text');
    const form = document.getElementById('task-form');
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    this.editing_task_id = task_id;
    this.current_image_base64 = null;
    this.current_attachments = [];
    this.current_tags = [];
    this.current_subtasks = [];
    this.current_comments = [];
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (task_id) {
      const task = this.task_manager.GetTaskById(task_id);
      if (task) {
        modal_title.textContent = t('task_modal.edit_title');
        modal_description.textContent = '';
        submit_text.textContent = t('task_modal.update_task');
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-date').value = task.date;
        const priority_value = task.task_priority || 'medium';
        const priority_radio = document.querySelector(
          `input[name="task-priority"][value="${priority_value}"]`
        );
        if (priority_radio) priority_radio.checked = true;
        if (task.tags && Array.isArray(task.tags)) {
          this.current_tags = [...task.tags];
        } else if (task.tag) {
          this.current_tags = [
            { name: task.tag, color: task.tag_color || 'blue' }
          ];
        }
        this.RenderTagsInModal();
        if (task.subtasks && Array.isArray(task.subtasks)) {
          this.current_subtasks = [...task.subtasks];
        }
        this.RenderSubtasksInModal();
        if (task.comments && Array.isArray(task.comments)) {
          this.current_comments = [...task.comments];
        }
        this.RenderCommentsInModal();
        setTimeout(() => {
          this.mde.value(task.description);
          this.mde.codemirror.refresh();
        }, 50);
        if (task.image) {
          this.current_image_base64 = task.image;
          this.ShowImagePreview(task.image);
        } else {
          this.RemoveImage();
        }

        if (task.attachments && task.attachments.length > 0) {
          this.current_attachments = [...task.attachments];
          this.RenderAttachmentsList();
        } else {
          this.current_attachments = [];
          this.RenderAttachmentsList();
        }
      }
    } else {
      modal_title.textContent = t('task_modal.add_title');
      if (modal_description) {
        modal_description.textContent = t('task_modal.add_task_description');
      }
      submit_text.textContent = t('task_modal.create_task');
      form.reset();
      const medium_radio = document.querySelector(
        'input[name="task-priority"][value="medium"]'
      );
      if (medium_radio) medium_radio.checked = true;
      setTimeout(() => {
        this.mde.value('');
        this.mde.codemirror.refresh();
      }, 50);
      this.RemoveImage();
      this.current_attachments = [];
      this.RenderAttachmentsList();
      this.RenderSubtasksInModal();
      this.RenderCommentsInModal();
    }
    setTimeout(() => {
      backdrop.classList.add('show');
      content.classList.add('show');
      if (typeof i18n_manager !== 'undefined' && i18n_manager) {
        i18n_manager.ApplyLanguage();
      }
    }, 10);
  }

  // Close task modal
  CloseTaskModal() {
    const modal = document.getElementById('task-modal');
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    backdrop.classList.remove('show');
    backdrop.classList.add('hide');
    content.classList.remove('show');
    content.classList.add('hide');
    setTimeout(() => {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
      backdrop.classList.remove('hide');
      content.classList.remove('hide');
      document.getElementById('task-form').reset();
      document.getElementById('task-tag-input').value = '';
      document.getElementById('subtask-input').value = '';
      document.getElementById('comment-input').value = '';
      this.mde.value('');
      this.RemoveImage();
      this.editing_task_id = null;
      this.current_image_base64 = null;
      this.current_attachments = [];
      this.current_tags = [];
      this.current_subtasks = [];
      this.current_comments = [];
      this.RenderTagsInModal();
      this.RenderSubtasksInModal();
      this.RenderCommentsInModal();
    }, 300);
  }

  // Handle task submit
  async HandleTaskSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = this.mde.value();
    const status = document.getElementById('task-status').value;
    const date = document.getElementById('task-date').value;
    const image = this.current_image_base64 || '';
    const attachments = this.current_attachments || [];
    const tags = this.current_tags.length > 0 ? this.current_tags : [];
    const task_priority =
      document.querySelector('input[name="task-priority"]:checked')?.value ||
      'medium';
    const subtasks = this.current_subtasks || [];
    const comments = this.current_comments || [];
    if (this.editing_task_id) {
      const updates = {
        title,
        description,
        status,
        date,
        tags,
        image,
        attachments,
        task_priority,
        subtasks,
        comments
      };
      const board_id = this.board_manager?.GetCurrentBoard()?.id;
      await this.task_manager.UpdateTask(
        this.editing_task_id,
        updates,
        board_id
      );
    } else {
      const new_task = this.task_manager.CreateTask(
        title,
        description,
        status,
        date,
        tags,
        attachments,
        task_priority,
        subtasks,
        comments
      );
      const board_id = this.board_manager?.GetCurrentBoard()?.id;
      await this.task_manager.AddTask(new_task, board_id);
    }
    this.RenderTasks();
    this.CloseTaskModal();
  }

  // Delete task
  async DeleteTask(id) {
    const board_id = this.board_manager?.GetCurrentBoard()?.id;
    await this.task_manager.DeleteTask(id, board_id);
    this.RenderTasks();
  }

  // Handle image upload
  HandleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_IMAGE_SIZE) {
      alert(
        `Image too large! Please use an image smaller than ${
          MAX_IMAGE_SIZE / 1024 / 1024
        }MB`
      );
      event.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      this.current_image_base64 = e.target.result;
      this.ShowImagePreview(this.current_image_base64);
    };
    reader.onerror = () => {
      alert('Error reading file');
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  }

  // Handle multiple files upload
  HandleMultipleFilesUpload(event) {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_TOTAL_FILES = 10;
    if (this.current_attachments.length + files.length > MAX_TOTAL_FILES) {
      alert(`You can only upload up to ${MAX_TOTAL_FILES} files`);
      event.target.value = '';
      return;
    }
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File "${file.name}" is too large! Please use a file smaller than ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const attachment = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          size: file.size,
          data: e.target.result
        };
        this.current_attachments.push(attachment);
        this.RenderAttachmentsList();
      };
      reader.onerror = () => {
        alert(`Error reading file "${file.name}"`);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  // Remove attachment
  RemoveAttachment(attachment_id) {
    this.current_attachments = this.current_attachments.filter(
      att => att.id !== attachment_id
    );
    this.RenderAttachmentsList();
  }

  // Render attachments list
  RenderAttachmentsList() {
    const t = key =>
      this.i18n_manager ? this.i18n_manager.Translate(key) : key;
    const container = document.getElementById('attachments-list');
    if (!container) return;
    if (this.current_attachments.length === 0) {
      container.innerHTML = `
        <div class="flex h-20 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          ${t('task_modal.no_attachments')}
        </div>
      `;
      return;
    }
    let html = '<div class="space-y-2">';
    this.current_attachments.forEach(att => {
      const size_text = this.FormatFileSize(att.size);
      const is_image = att.type === 'image';
      if (is_image) {
        html += `
          <div class="group relative flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-5 dark:border-gray-800 dark:bg-white/5">
            <button
              type="button"
              onclick="ui_manager.RemoveAttachment('${att.id}')"
              class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900 hover:text-red-500"
            >
              <svg class="fill-current" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.02145 8.2704C2.82618 8.46567 2.82618 8.78225 3.02145 8.97751C3.21671 9.17277 3.53329 9.17277 3.72855 8.97751L5.99935 6.70672L8.2704 8.97777C8.46567 9.17303 8.78225 9.17303 8.97751 8.97777C9.17277 8.78251 9.17277 8.46592 8.97751 8.27066L6.70646 5.99961L8.97751 3.72855C9.17277 3.53329 9.17277 3.21671 8.97751 3.02145C8.78225 2.82618 8.46567 2.82618 8.2704 3.02145L5.99935 5.2925L3.72855 3.02171C3.53329 2.82644 3.21671 2.82644 3.02145 3.02171C2.82618 3.21697 2.82618 3.53355 3.02145 3.72881L5.29224 5.99961L3.02145 8.2704Z" fill=""></path>
              </svg>
            </button>
            <div class="h-10 w-10 flex-shrink-0">
              <img src="${att.data}" alt="${att.name}" class="h-full w-full rounded-lg object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-white/90 truncate">${att.name}</p>
              <span class="flex items-center gap-1.5">
                <span class="text-xs text-gray-500 dark:text-gray-400">Image • ${size_text}</span>
              </span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="group relative flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-5 dark:border-gray-800 dark:bg-white/5 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors" onclick="ui_manager.DownloadAttachmentById('${att.id}')">
            <button
              type="button"
              onclick="event.stopPropagation(); ui_manager.RemoveAttachment('${att.id}')"
              class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900 hover:text-red-500"
            >
              <svg class="fill-current" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.02145 8.2704C2.82618 8.46567 2.82618 8.78225 3.02145 8.97751C3.21671 9.17277 3.53329 9.17277 3.72855 8.97751L5.99935 6.70672L8.2704 8.97777C8.46567 9.17303 8.78225 9.17303 8.97751 8.97777C9.17277 8.78251 9.17277 8.46592 8.97751 8.27066L6.70646 5.99961L8.97751 3.72855C9.17277 3.53329 9.17277 3.21671 8.97751 3.02145C8.78225 2.82618 8.46567 2.82618 8.2704 3.02145L5.99935 5.2925L3.72855 3.02171C3.53329 2.82644 3.21671 2.82644 3.02145 3.02171C2.82618 3.21697 2.82618 3.53355 3.02145 3.72881L5.29224 5.99961L3.02145 8.2704Z" fill=""></path>
              </svg>
            </button>
            <div class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-white/90 truncate">${att.name}</p>
              <span class="flex items-center gap-1.5">
                <span class="text-xs text-gray-500 dark:text-gray-400">File • ${size_text} • Click to download</span>
              </span>
            </div>
          </div>
        `;
      }
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // Format file size
  FormatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Open image viewer
  OpenImageViewer(task_id, image_index, is_navigating = false) {
    const task = this.task_manager.GetTaskById(task_id);
    if (!task || !task.attachments) return;
    const images = task.attachments.filter(att => att.type === 'image');
    if (image_index >= images.length) return;
    const modal = document.getElementById('image-viewer-modal');
    const img = document.getElementById('viewer-image');
    const caption = document.getElementById('viewer-caption');
    const counter = document.getElementById('viewer-counter');
    if (is_navigating) {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      setTimeout(() => {
        img.src = images[image_index].data;
        caption.textContent = images[image_index].name;
        counter.textContent = `${image_index + 1} / ${images.length}`;
        setTimeout(() => {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        }, 50);
      }, 200);
    } else {
      img.src = images[image_index].data;
      caption.textContent = images[image_index].name;
      counter.textContent = `${image_index + 1} / ${images.length}`;
    }
    modal.dataset.taskId = task_id;
    modal.dataset.currentIndex = image_index;
    modal.dataset.totalImages = images.length;
    if (!is_navigating) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => {
        const backdrop = modal.querySelector('.modal-backdrop');
        const content = modal.querySelector('.modal-content');
        if (backdrop) backdrop.classList.add('show');
        if (content) content.classList.add('show');
      }, 10);
    }
  }

  // Close image viewer
  CloseImageViewer() {
    const modal = document.getElementById('image-viewer-modal');
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    if (backdrop) backdrop.classList.remove('show');
    if (content) content.classList.remove('show');
    setTimeout(() => {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }, 200);
  }

  // Navigate image viewer
  NavigateImageViewer(direction) {
    const modal = document.getElementById('image-viewer-modal');
    const task_id = modal.dataset.taskId;
    const current_index = parseInt(modal.dataset.currentIndex);
    const total_images = parseInt(modal.dataset.totalImages);
    let new_index = current_index + direction;
    if (new_index < 0) new_index = total_images - 1;
    if (new_index >= total_images) new_index = 0;
    this.OpenImageViewer(task_id, new_index, true);
  }

  // Preview attachment
  PreviewAttachment(task_id, attachment_index) {
    const task = this.task_manager.GetTaskById(task_id);
    if (!task || !task.attachments || !task.attachments[attachment_index])
      return;
    const attachment = task.attachments[attachment_index];
    const preview_window = window.open('', '_blank');
    if (!preview_window) {
      alert('Please allow pop-ups to preview files');
      return;
    }
    const file_extension = attachment.name.split('.').pop().toLowerCase();
    const mime_type = attachment.data.split(':')[1]?.split(';')[0] || '';
    const is_text =
      ['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(file_extension) ||
      mime_type.startsWith('text/');
    const is_pdf =
      file_extension === 'pdf' ||
      mime_type === 'application/pdf' ||
      attachment.data.startsWith('data:application/pdf');
    if (is_pdf) {
      preview_window.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${attachment.name}</title>
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            iframe { width: 100vw; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${attachment.data}"></iframe>
        </body>
        </html>
      `);
    } else if (is_text) {
      fetch(attachment.data)
        .then(res => res.text())
        .then(text => {
          preview_window.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${attachment.name}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: 'Courier New', monospace; 
                  background: #1e1e1e; 
                  color: #d4d4d4;
                  line-height: 1.6;
                }
                pre { 
                  white-space: pre-wrap; 
                  word-wrap: break-word; 
                  margin: 0;
                }
                .header {
                  background: #252526;
                  padding: 10px 20px;
                  margin: -20px -20px 20px -20px;
                  border-bottom: 1px solid #3e3e42;
                  color: #cccccc;
                  font-family: system-ui, -apple-system, sans-serif;
                }
              </style>
            </head>
            <body>
              <div class="header">${attachment.name}</div>
              <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
            </html>
          `);
        })
        .catch(() => {
          preview_window.document.write(`
            <html><body style="padding: 20px; font-family: sans-serif;">
              <h3>Cannot preview this file</h3>
              <p>File: ${attachment.name}</p>
              <button onclick="window.close()">Close</button>
            </body></html>
          `);
        });
    } else {
      preview_window.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${attachment.name}</title>
          <style>
            body { 
              margin: 0; 
              padding: 40px; 
              font-family: system-ui, -apple-system, sans-serif;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            h2 { margin: 0 0 10px 0; color: #333; }
            p { color: #666; margin: 10px 0 30px 0; }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 14px;
              cursor: pointer;
              margin: 5px;
            }
            button:hover { background: #2563eb; }
            .close-btn { background: #6b7280; }
            .close-btn:hover { background: #4b5563; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>📄 ${attachment.name}</h2>
            <p>Preview not available for this file type</p>
            <button onclick="downloadFile()">Download File</button>
            <button class="close-btn" onclick="window.close()">Close</button>
          </div>
          <script>
            function downloadFile() {
              const link = document.createElement('a');
              link.href = '${attachment.data}';
              link.download = '${attachment.name}';
              link.click();
            }
          </script>
        </body>
        </html>
      `);
    }
  }

  // Download attachment
  DownloadAttachment(task_id, attachment_index) {
    const task = this.task_manager.GetTaskById(task_id);
    if (!task || !task.attachments || !task.attachments[attachment_index])
      return;
    const attachment = task.attachments[attachment_index];
    this.DownloadFile(attachment.data, attachment.name);
  }

  // Download attachment by ID
  DownloadAttachmentById(attachment_id) {
    const attachment = this.current_attachments.find(
      att => att.id === attachment_id
    );
    if (!attachment) return;
    this.DownloadFile(attachment.data, attachment.name);
  }

  // Download file
  DownloadFile(data_url, filename) {
    try {
      const link = document.createElement('a');
      link.href = data_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  }

  // Show image preview
  ShowImagePreview(image_data) {
    const preview_container = document.getElementById('image-preview');
    const preview_img = document.getElementById('preview-img');
    const no_attachment = document.getElementById('no-attachment');
    preview_img.src = image_data;
    preview_container.classList.remove('hidden');
    if (no_attachment) {
      no_attachment.classList.add('hidden');
    }
  }

  // Remove image
  RemoveImage() {
    this.current_image_base64 = null;
    const image_input = document.getElementById('task-image');
    if (image_input) image_input.value = '';
    const image_preview = document.getElementById('image-preview');
    if (image_preview) image_preview.classList.add('hidden');
    const preview_img = document.getElementById('preview-img');
    if (preview_img) preview_img.src = '';
    const no_attachment = document.getElementById('no-attachment');
    if (no_attachment) {
      no_attachment.classList.remove('hidden');
    }
  }

  // Filter tasks
  FilterTasks(filter) {
    this.task_manager.current_filter = filter;
    const buttons = {
      All: 'filter-all',
      Todo: 'filter-todo',
      InProgress: 'filter-inprogress',
      Completed: 'filter-completed'
    };
    Object.entries(buttons).forEach(([key, id]) => {
      const button = document.getElementById(id);
      const span = button.querySelectorAll('span')[1];
      if (key === filter) {
        button.className =
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md group hover:text-gray-900 dark:hover:text-white text-gray-900 dark:text-white bg-white dark:bg-gray-800';
        span.className =
          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium leading-normal group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400 text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15';
      } else {
        button.className =
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md group hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400';
        span.className =
          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium leading-normal group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400 bg-white dark:bg-white/[0.03]';
      }
    });
    this.RenderTasks();
  }

  // Toggle filter dropdown
  ToggleFilterDropdown() {
    const dropdown = document.getElementById('filter-dropdown');
    dropdown.classList.toggle('hidden');
  }

  // Apply sort and filter
  ApplySortAndFilter() {
    this.task_manager.current_sort = document.getElementById('sort-by').value;
    this.task_manager.current_tag_filter =
      document.getElementById('filter-tag').value;
    localStorage.setItem('kanban_sort', this.task_manager.current_sort);
    localStorage.setItem(
      'kanban_tag_filter',
      this.task_manager.current_tag_filter
    );
    this.RenderTasks();
  }

  // Reset filters
  ResetFilters() {
    document.getElementById('sort-by').value = 'created-desc';
    document.getElementById('filter-tag').value = '';
    this.task_manager.current_sort = 'created-desc';
    this.task_manager.current_tag_filter = '';
    localStorage.setItem('kanban_sort', 'created-desc');
    localStorage.setItem('kanban_tag_filter', '');
    this.RenderTasks();
  }

  // Toggle date filter dropdown
  ToggleDateFilterDropdown() {
    const dropdown = document.getElementById('date-filter-dropdown');
    dropdown.classList.toggle('hidden');
  }

  // Apply date filter
  ApplyDateFilter(range) {
    this.task_manager.current_date_filter = range;
    this.task_manager.custom_date = null;
    localStorage.setItem('kanban_date_filter', range);
    localStorage.removeItem('kanban_custom_date');
    const label_map = {
      today: 'Today',
      yesterday: 'Yesterday',
      'this-week': 'This Week',
      'this-month': 'This Month',
      'this-year': 'This Year',
      all: 'All'
    };
    const dropdown = document.getElementById('date-filter-dropdown');
    dropdown.classList.add('hidden');
    const custom_date_picker = document.getElementById('custom-date-picker');
    if (custom_date_picker) {
      custom_date_picker.value = '';
    }
    this.RenderTasks();
  }

  // Apply custom date filter
  ApplyCustomDateFilter() {
    const custom_date_picker = document.getElementById('custom-date-picker');
    const selected_date = custom_date_picker.value;
    if (!selected_date) return;
    this.task_manager.current_date_filter = 'custom';
    this.task_manager.custom_date = selected_date;
    localStorage.setItem('kanban_date_filter', 'custom');
    localStorage.setItem('kanban_custom_date', selected_date);
    const date_obj = new Date(selected_date);
    const formatted_date = this.FormatDate(date_obj);
    const dropdown = document.getElementById('date-filter-dropdown');
    dropdown.classList.add('hidden');
    this.RenderTasks();
  }

  // Format date
  FormatDate(date_input) {
    if (!date_input) return '';
    const date = date_input instanceof Date ? date_input : new Date(date_input);
    if (isNaN(date.getTime())) return '';
    if (typeof i18n_manager !== 'undefined' && i18n_manager) {
      return i18n_manager.FormatDate(date_input);
    }
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  // Navigate date previous
  NavigateDatePrevious() {
    const current_filter = this.task_manager.current_date_filter;
    const now = new Date();
    switch (current_filter) {
      case 'today': {
        this.ApplyDateFilter('yesterday');
        break;
      }
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const day_before = new Date(yesterday);
        day_before.setDate(day_before.getDate() - 1);
        this.ApplyCustomDateWithDate(day_before);
        break;
      }
      case 'this-week': {
        const week_start = new Date(now);
        const day_of_week = week_start.getDay();
        const diff = day_of_week === 0 ? 6 : day_of_week - 1;
        week_start.setDate(week_start.getDate() - diff - 7);
        this.ApplyCustomDateWithDate(week_start);
        break;
      }
      case 'this-month': {
        const last_month = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        this.ApplyCustomDateWithDate(last_month);
        break;
      }
      case 'this-year': {
        const last_year = new Date(now.getFullYear() - 1, 0, 1);
        this.ApplyCustomDateWithDate(last_year);
        break;
      }
      case 'custom': {
        if (this.task_manager.custom_date) {
          const current_date = new Date(this.task_manager.custom_date);
          current_date.setDate(current_date.getDate() - 1);
          this.ApplyCustomDateWithDate(current_date);
        }
        break;
      }
      default: {
        this.ApplyDateFilter('today');
        break;
      }
    }
  }

  // Navigate date next
  NavigateDateNext() {
    const current_filter = this.task_manager.current_date_filter;
    const now = new Date();
    switch (current_filter) {
      case 'yesterday': {
        this.ApplyDateFilter('today');
        break;
      }
      case 'today': {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.ApplyCustomDateWithDate(tomorrow);
        break;
      }
      case 'this-week': {
        const week_start = new Date(now);
        const day_of_week = week_start.getDay();
        const diff = day_of_week === 0 ? 6 : day_of_week - 1;
        week_start.setDate(week_start.getDate() - diff + 7);
        this.ApplyCustomDateWithDate(week_start);
        break;
      }
      case 'this-month': {
        const next_month = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        this.ApplyCustomDateWithDate(next_month);
        break;
      }
      case 'this-year': {
        const next_year = new Date(now.getFullYear() + 1, 0, 1);
        this.ApplyCustomDateWithDate(next_year);
        break;
      }
      case 'custom': {
        if (this.task_manager.custom_date) {
          const current_date = new Date(this.task_manager.custom_date);
          current_date.setDate(current_date.getDate() + 1);
          this.ApplyCustomDateWithDate(current_date);
        }
        break;
      }
      default: {
        this.ApplyDateFilter('today');
        break;
      }
    }
  }

  // Apply custom date with date object
  ApplyCustomDateWithDate(date_obj) {
    const year = date_obj.getFullYear();
    const month = String(date_obj.getMonth() + 1).padStart(2, '0');
    const day = String(date_obj.getDate()).padStart(2, '0');
    const date_string = `${year}-${month}-${day}`;
    this.task_manager.current_date_filter = 'custom';
    this.task_manager.custom_date = date_string;
    const formatted_date = this.FormatDate(date_obj);
    const custom_date_picker = document.getElementById('custom-date-picker');
    if (custom_date_picker) {
      custom_date_picker.value = date_string;
    }
    this.RenderTasks();
  }

  // Add subtask
  AddSubtask() {
    const subtask_input = document.getElementById('subtask-input');
    const subtask_text = subtask_input.value.trim();
    if (!subtask_text) return;
    const subtask = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      text: subtask_text,
      completed: false
    };
    this.current_subtasks.push(subtask);
    this.RenderSubtasksInModal();
    subtask_input.value = '';
    subtask_input.focus();
  }

  // Toggle subtask
  ToggleSubtask(subtask_id) {
    const subtask = this.current_subtasks.find(st => st.id === subtask_id);
    if (subtask) {
      subtask.completed = !subtask.completed;
      this.RenderSubtasksInModal();
    }
  }

  // Remove subtask
  RemoveSubtask(subtask_id) {
    this.current_subtasks = this.current_subtasks.filter(
      st => st.id !== subtask_id
    );
    this.RenderSubtasksInModal();
  }

  // Render subtasks in modal
  RenderSubtasksInModal() {
    const t = key =>
      this.i18n_manager ? this.i18n_manager.Translate(key) : key;
    const container = document.getElementById('subtasks-container');
    if (!container) return;
    if (this.current_subtasks.length === 0) {
      container.innerHTML = `<span class="text-sm text-gray-400 dark:text-gray-500">${t('task_modal.no_subtasks')}</span>`;
      return;
    }
    container.innerHTML = this.current_subtasks
      .map(subtask => {
        const checked = subtask.completed ? 'checked' : '';
        const line_through = subtask.completed
          ? 'line-through text-gray-400 dark:text-gray-500'
          : 'text-gray-800 dark:text-white/90';
        return `
          <div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-600">
            <label class="custom-checkbox cursor-pointer">
              <input 
                type="checkbox" 
                ${checked}
                onchange="ui_manager.ToggleSubtask('${subtask.id}')"
              />
              <span class="custom-checkbox-box">
                <svg class="custom-checkbox-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
            </label>
            <span class="flex-1 text-sm ${line_through}">${this.EscapeHtml(subtask.text)}</span>
            <button 
              type="button"
              onclick="ui_manager.RemoveSubtask('${subtask.id}')"
              class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Remove subtask"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        `;
      })
      .join('');
  }

  // Add comment
  AddComment() {
    const comment_input = document.getElementById('comment-input');
    const comment_text = comment_input.value.trim();
    if (!comment_text) return;
    const comment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      text: comment_text,
      timestamp: new Date().toISOString()
    };
    this.current_comments.push(comment);
    this.RenderCommentsInModal();
    comment_input.value = '';
    comment_input.focus();
  }

  // Remove comment
  RemoveComment(comment_id) {
    this.current_comments = this.current_comments.filter(
      c => c.id !== comment_id
    );
    this.RenderCommentsInModal();
  }

  // Toggle subtask in card (inline)
  async ToggleSubtaskInCard(task_id, subtask_id) {
    const task = this.task_manager.GetTaskById(task_id);
    if (!task || !task.subtasks) return;
    const subtask = task.subtasks.find(st => st.id === subtask_id);
    if (subtask) {
      subtask.completed = !subtask.completed;
      const board_id = this.board_manager?.GetCurrentBoard()?.id;
      await this.task_manager.UpdateTask(
        task_id,
        { subtasks: task.subtasks },
        board_id
      );
      this.RenderTasks();
    }
  }

  // Show comments modal
  ShowCommentsModal(task_id) {
    const task = this.task_manager.GetTaskById(task_id);
    if (!task || !task.comments || task.comments.length === 0) return;
    const modal_id = 'comments-viewer-modal';
    let modal = document.getElementById(modal_id);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modal_id;
      modal.className =
        'fixed inset-0 z-50 flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }
    let comments_html = '';
    task.comments.forEach(comment => {
      const date = new Date(comment.timestamp);
      const formatted_time = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      comments_html += `
        <div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">${formatted_time}</span>
          </div>
          <p class="text-sm text-gray-800 dark:text-white/90 whitespace-pre-wrap">${this.EscapeHtml(comment.text)}</p>
        </div>
      `;
    });
    modal.innerHTML = `
      <div class="modal-backdrop absolute inset-0 bg-black/50" onclick="ui_manager.CloseCommentsModal()"></div>
      <div class="modal-content relative w-full max-w-[600px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl lg:p-8 dark:bg-gray-900">
        <div class="px-2 mb-6">
          <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">💬 Comments</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">${task.comments.length} comment${task.comments.length > 1 ? 's' : ''} on "${this.EscapeHtml(task.title)}"</p>
        </div>
        <button onclick="ui_manager.CloseCommentsModal()" class="absolute right-5 top-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 sm:h-11 sm:w-11 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-300">
          <svg class="h-5 w-5 fill-current sm:h-6 sm:w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill=""></path>
          </svg>
        </button>
        <div class="px-2 space-y-3">
          ${comments_html}
        </div>
        <div class="mt-6 flex items-center justify-end gap-3 px-2">
          <button onclick="ui_manager.CloseCommentsModal()" class="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">Close</button>
          ${typeof is_readonly_mode !== 'undefined' && is_readonly_mode ? '' : `<button onclick="ui_manager.OpenTaskModal('${task_id}'); ui_manager.CloseCommentsModal();" class="bg-brand-500 hover:bg-brand-600 flex justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white">Edit Task</button>`}
        </div>
      </div>
    `;
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    setTimeout(() => {
      backdrop.classList.add('show');
      content.classList.add('show');
    }, 10);
  }

  // Close comments modal
  CloseCommentsModal() {
    const modal = document.getElementById('comments-viewer-modal');
    if (!modal) return;
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    backdrop.classList.remove('show');
    backdrop.classList.add('hide');
    content.classList.remove('show');
    content.classList.add('hide');
    setTimeout(() => {
      modal.remove();
    }, 200);
  }

  // Render comments in modal
  RenderCommentsInModal() {
    const t = key =>
      this.i18n_manager ? this.i18n_manager.Translate(key) : key;
    const container = document.getElementById('comments-container');
    if (!container) return;
    if (this.current_comments.length === 0) {
      container.innerHTML = `<span class="text-sm text-gray-400 dark:text-gray-500">${t('task_modal.no_comments')}</span>`;
      return;
    }
    container.innerHTML = this.current_comments
      .map(comment => {
        const date = new Date(comment.timestamp);
        const formatted_time = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return `
          <div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <div class="flex items-start justify-between gap-2">
              <p class="flex-1 text-sm text-gray-800 dark:text-white/90">${this.EscapeHtml(comment.text)}</p>
              <button 
                type="button"
                onclick="ui_manager.RemoveComment('${comment.id}')"
                class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remove comment"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
            <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">${formatted_time}</span>
          </div>
        `;
      })
      .join('');
  }
}
