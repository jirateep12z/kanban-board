let database;
let task_manager;
let board_manager;
let template_manager;
let recurring_task_manager;
let analytics_manager;
let theme_manager;
let i18n_manager;
let ui_manager;
let drag_drop_manager;
let is_readonly_mode = false;
let selected_import_file = null;

function GetCurrentBoardId() {
  return board_manager?.GetCurrentBoard()?.id || null;
}

function ImportShareData(compressed) {
  try {
    if (!compressed || typeof LZString === 'undefined') {
      console.error('Invalid compressed data or LZ-String not loaded');
      return null;
    }
    const json_string = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json_string) {
      console.error('Failed to decompress data');
      return null;
    }
    return JSON.parse(json_string);
  } catch (e) {
    console.error('Error importing share data:', e);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const url_params = new URLSearchParams(window.location.search);
  const share_data = url_params.get('share');
  database = new Database();
  await database.InitDB();
  task_manager = new TaskManager(database);
  board_manager = new BoardManager(database);
  template_manager = new TemplateManager(database);
  recurring_task_manager = new RecurringTaskManager(database, task_manager);
  analytics_manager = new AnalyticsManager(task_manager, null);
  theme_manager = new ThemeManager();
  theme_manager.InitTheme();
  i18n_manager = new I18nManager();
  await board_manager.LoadBoards();
  await template_manager.LoadTemplates();
  await recurring_task_manager.LoadRecurringTasks();
  if (share_data) {
    is_readonly_mode = true;
    const shared_data = ImportShareData(share_data);
    if (shared_data) {
      if (shared_data.board) {
        document.getElementById('current-board-name').textContent =
          shared_data.board.name || 'Shared Board';
      }
      task_manager.tasks = shared_data.tasks || [];
    } else {
      alert('Cannot load data from share link');
    }
  } else {
    const current_board = board_manager.GetCurrentBoard();
    await task_manager.LoadTasks(current_board?.id);
    const saved_mode = localStorage.getItem('kanban_edit_mode');
    if (saved_mode !== null) {
      is_readonly_mode = saved_mode === 'read';
    }
  }
  ui_manager = new UIManager(task_manager, board_manager);
  ui_manager.i18n_manager = i18n_manager;
  ui_manager.InitMarkdownEditor();
  drag_drop_manager = new DragDropManager(
    task_manager,
    ui_manager,
    board_manager
  );
  if (is_readonly_mode && share_data) {
    EnableReadonlyMode();
  }
  UpdateEditModeUI();
  if (!share_data) {
    const saved_date_filter = localStorage.getItem('kanban_date_filter');
    const saved_custom_date = localStorage.getItem('kanban_custom_date');
    if (saved_date_filter) {
      if (saved_date_filter === 'custom' && saved_custom_date) {
        task_manager.current_date_filter = 'custom';
        task_manager.custom_date = saved_custom_date;
        const custom_date_picker =
          document.getElementById('custom-date-picker');
        if (custom_date_picker) custom_date_picker.value = saved_custom_date;
      } else {
        task_manager.current_date_filter = saved_date_filter;
      }
    }
    const saved_sort = localStorage.getItem('kanban_sort');
    if (saved_sort) {
      task_manager.current_sort = saved_sort;
      const sort_select = document.getElementById('sort-by');
      if (sort_select) sort_select.value = saved_sort;
    }
    const saved_tag_filter = localStorage.getItem('kanban_tag_filter');
    if (saved_tag_filter) {
      task_manager.current_tag_filter = saved_tag_filter;
      const tag_select = document.getElementById('filter-tag');
      if (tag_select) tag_select.value = saved_tag_filter;
    }
    await recurring_task_manager.CheckAndCreateDueTasks();
  }
  ui_manager.RenderTasks();
  SetupEventListeners();
  UpdateLanguageCheckmarks();
});

function SetupEventListeners() {
  const tag_input = document.getElementById('task-tag-input');
  if (tag_input) {
    tag_input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        ui_manager.AddTag();
      }
    });
  }
  const subtask_input = document.getElementById('subtask-input');
  if (subtask_input) {
    subtask_input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        ui_manager.AddSubtask();
      }
    });
  }
  const comment_input = document.getElementById('comment-input');
  if (comment_input) {
    comment_input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        ui_manager.AddComment();
      }
    });
  }
  document.addEventListener('keydown', e => {
    const image_modal = document.getElementById('image-viewer-modal');
    if (image_modal && !image_modal.classList.contains('hidden')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ui_manager.NavigateImageViewer(-1);
        return;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        ui_manager.NavigateImageViewer(1);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        ui_manager.CloseImageViewer();
        return;
      }
    }
    const task_modal = document.getElementById('task-modal');
    const is_modal_open =
      task_modal && !task_modal.classList.contains('hidden');
    const is_input_focused =
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.classList.contains('CodeMirror');
    if (is_input_focused && !e.ctrlKey && !e.metaKey) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      if (!is_modal_open) OpenTaskModal();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (is_modal_open) {
        CloseTaskModal();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (is_modal_open) {
        document.getElementById('task-form')?.requestSubmit();
      }
    } else if (e.key === '?' && !is_input_focused) {
      e.preventDefault();
      ShowKeyboardShortcutsModal();
    }
  });
  document.addEventListener('click', e => {
    const dropdown_container = document.getElementById(
      'filter-dropdown-container'
    );
    const dropdown = document.getElementById('filter-dropdown');
    if (dropdown_container && !dropdown_container.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
    const date_dropdown_container = document.getElementById(
      'date-filter-dropdown-container'
    );
    const date_dropdown = document.getElementById('date-filter-dropdown');
    if (
      date_dropdown_container &&
      !date_dropdown_container.contains(e.target)
    ) {
      date_dropdown.classList.add('hidden');
    }
  });
  document
    .getElementById('task-form')
    .addEventListener('submit', e => ui_manager.HandleTaskSubmit(e));
}

function OpenTaskModal(task_id = null) {
  ui_manager.OpenTaskModal(task_id);
}

function CloseTaskModal() {
  ui_manager.CloseTaskModal();
}

function FilterTasks(filter) {
  ui_manager.FilterTasks(filter);
}

function ToggleFilterDropdown() {
  ui_manager.ToggleFilterDropdown();
}

function ApplySortAndFilter() {
  ui_manager.ApplySortAndFilter();
}

function ResetFilters() {
  ui_manager.ResetFilters();
}

function ToggleDateFilterDropdown() {
  ui_manager.ToggleDateFilterDropdown();
}

function ApplyDateFilter(range) {
  ui_manager.ApplyDateFilter(range);
}

function ApplyCustomDateFilter() {
  ui_manager.ApplyCustomDateFilter();
}

function NavigateDatePrevious() {
  ui_manager.NavigateDatePrevious();
}

function NavigateDateNext() {
  ui_manager.NavigateDateNext();
}

function HandleImageUpload(event) {
  ui_manager.HandleImageUpload(event);
}

function RemoveImage() {
  ui_manager.RemoveImage();
}

function UpdateColorPreview() {
  ui_manager.UpdateColorPreview();
}

function HandleMultipleFilesUpload(event) {
  ui_manager.HandleMultipleFilesUpload(event);
}

function RemoveAttachment(attachment_id) {
  ui_manager.RemoveAttachment(attachment_id);
}

function OpenImageViewer(task_id, image_index) {
  ui_manager.OpenImageViewer(task_id, image_index);
}

function CloseImageViewer() {
  ui_manager.CloseImageViewer();
}

function NavigateImageViewer(direction) {
  ui_manager.NavigateImageViewer(direction);
}

function DownloadAttachment(task_id, attachment_index) {
  ui_manager.DownloadAttachment(task_id, attachment_index);
}

function DownloadAttachmentById(attachment_id) {
  ui_manager.DownloadAttachmentById(attachment_id);
}

function HandleDragStart(event, task_id) {
  drag_drop_manager.HandleDragStart(event, task_id);
}

function HandleDragEnd(event) {
  drag_drop_manager.HandleDragEnd(event);
}

function HandleTaskDragOver(event, task_id) {
  drag_drop_manager.HandleTaskDragOver(event, task_id);
}

function HandleTaskDrop(event, task_id) {
  drag_drop_manager.HandleTaskDrop(event, task_id);
}

function HandleDragOver(event) {
  drag_drop_manager.HandleDragOver(event);
}
function HandleDragLeave(event) {
  drag_drop_manager.HandleDragLeave(event);
}

function HandleDrop(event) {
  drag_drop_manager.HandleDrop(event);
}

function OpenShareModal() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const current_board = board_manager.GetCurrentBoard();
  if (!current_board) {
    alert(t('errors.no_board'));
    return;
  }
  if (!task_manager || !task_manager.tasks) {
    alert(t('errors.tasks_not_found'));
    return;
  }
  const sanitized_tasks = task_manager.tasks.map(task => ({
    ...task,
    image: '',
    attachments: []
  }));
  const share_data = {
    board: {
      name: current_board.name || 'My Board',
      description: current_board.description || '',
      columns: current_board.columns || ['Todo', 'InProgress', 'Completed']
    },
    tasks: sanitized_tasks
  };
  const share_url = GenerateShareURL(share_data);
  if (!share_url) {
    alert(t('share.cannot_create'));
    return;
  }
  const share_url_input = document.getElementById('share-url');
  if (!share_url_input) {
    alert(t('errors.element_not_found'));
    return;
  }
  share_url_input.value = share_url;
  const modal = document.getElementById('share-modal');
  if (!modal) {
    alert(t('errors.modal_not_found'));
    return;
  }
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  if (!backdrop || !content) {
    alert(t('errors.modal_incomplete'));
    return;
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function GenerateShareURL(share_data) {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);

  try {
    if (typeof LZString === 'undefined') {
      console.error('LZ-String library not loaded');
      alert(t('share.cannot_create'));
      return null;
    }
    const json_string = JSON.stringify(share_data);
    const compressed = LZString.compressToEncodedURIComponent(json_string);
    if (!compressed) {
      console.error('Failed to compress data');
      return null;
    }
    const base_url = window.location.origin + window.location.pathname;
    const share_url = `${base_url}?share=${compressed}`;
    if (share_url.length > 8000) {
      console.warn('Share URL is very long:', share_url.length, 'characters');
      alert(t('share.url_too_long'));
    }
    return share_url;
  } catch (e) {
    console.error('Error generating share URL:', e);
    return null;
  }
}

function CloseShareModal() {
  const modal = document.getElementById('share-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  backdrop.classList.remove('show');
  backdrop.classList.add('hide');
  content.classList.remove('show');
  content.classList.add('hide');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    backdrop.classList.remove('hide');
    content.classList.remove('hide');
  }, 200);
}

function CopyShareURL() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const share_url_input = document.getElementById('share-url');
  share_url_input.select();
  share_url_input.setSelectionRange(0, 99999);
  try {
    navigator.clipboard.writeText(share_url_input.value);
    const copy_button = event.target.closest('button');
    const original_text = copy_button.innerHTML;
    copy_button.innerHTML = `
      <svg class="fill-current" width="20" height="20" viewBox="0 0 640 640" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/>
      </svg>
      ${t('share.copied')}
    `;
    setTimeout(() => {
      copy_button.innerHTML = original_text;
    }, 2000);
  } catch (err) {
    alert('Cannot copy link');
  }
}

function ToggleEditMode() {
  is_readonly_mode = !is_readonly_mode;
  localStorage.setItem('kanban_edit_mode', is_readonly_mode ? 'read' : 'edit');
  UpdateEditModeUI();
  ui_manager.RenderTasks();
}

function UpdateEditModeUI() {
  const toggle_button = document.getElementById('edit-mode-toggle');
  const icon = document.getElementById('edit-mode-icon');
  if (is_readonly_mode) {
    if (toggle_button) {
      toggle_button.classList.remove(
        'border-gray-300',
        'text-gray-700',
        'hover:bg-gray-50',
        'dark:border-gray-700',
        'dark:text-gray-400'
      );
      toggle_button.classList.add(
        'border-green-300',
        'text-green-700',
        'bg-green-50',
        'hover:bg-green-100',
        'dark:border-green-700',
        'dark:text-green-400',
        'dark:bg-green-500/15'
      );
    }
    if (icon) {
      icon.innerHTML = `
        <path
          d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"
        />
      `;
    }
  } else {
    if (toggle_button) {
      toggle_button.classList.remove(
        'border-green-300',
        'text-green-700',
        'bg-green-50',
        'hover:bg-green-100',
        'dark:border-green-700',
        'dark:text-green-400',
        'dark:bg-green-500/15'
      );
      toggle_button.classList.add(
        'border-gray-300',
        'text-gray-700',
        'hover:bg-gray-50',
        'dark:border-gray-700',
        'dark:text-gray-400'
      );
    }
    if (icon) {
      icon.innerHTML = `
        <path
          d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"
        />
      `;
    }
  }
}

function EnableReadonlyMode() {
  const add_task_button = document.getElementById('add-task-button');
  const share_board_button = document.getElementById('share-board-button');
  const import_export_button = document.getElementById('import-export-button');
  const filter_dropdown_container = document.getElementById(
    'filter-dropdown-container'
  );
  const edit_mode_toggle = document.getElementById('edit-mode-toggle');
  if (add_task_button) add_task_button.style.display = 'none';
  if (share_board_button) share_board_button.style.display = 'none';
  if (import_export_button) import_export_button.style.display = 'none';
  if (filter_dropdown_container)
    filter_dropdown_container.style.display = 'none';
  if (edit_mode_toggle) edit_mode_toggle.style.display = 'none';
  const main_container = document.querySelector('.max-w-\\[1400px\\]');
  if (main_container) {
    const readonly_banner = document.createElement('div');
    readonly_banner.className =
      'mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20';
    readonly_banner.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 flex-shrink-0 fill-yellow-500" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.25709 3.09882C9.02209 1.73952 10.9779 1.73952 11.7429 3.09882L17.3216 13.0463C18.0574 14.3506 17.1084 16 15.5787 16H4.42132C2.89158 16 1.94257 14.3506 2.67841 13.0463L8.25709 3.09882ZM10 6C10.5523 6 11 6.44772 11 7V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V7C9 6.44772 9.44772 6 10 6ZM10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14Z" fill=""/>
        </svg>
        <div class="text-sm text-yellow-700 dark:text-yellow-300">
          <p class="font-medium">Read-Only Mode</p>
          <p class="text-xs mt-1">You are viewing a shared board. You cannot edit, add, or delete tasks.</p>
        </div>
      </div>
    `;
    main_container.insertBefore(readonly_banner, main_container.firstChild);
  }
  const swim_lanes = document.querySelectorAll('.swim-lane');
  swim_lanes.forEach(lane => {
    lane.removeAttribute('ondrop');
    lane.removeAttribute('ondragover');
    lane.removeAttribute('ondragleave');
  });
}

function OpenImportExportModal() {
  const modal = document.getElementById('import-export-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  selected_import_file = null;
  const file_input = document.getElementById('import-file-input');
  const file_label = document.getElementById('import-file-label');
  const import_button = document.getElementById('import-button');
  if (file_input) file_input.value = '';
  if (file_label) file_label.textContent = 'Choose JSON File';
  if (import_button) {
    import_button.disabled = true;
    import_button.classList.add(
      'bg-gray-300',
      'text-gray-500',
      'cursor-not-allowed',
      'dark:bg-gray-700',
      'dark:text-gray-500'
    );
    import_button.classList.remove(
      'bg-brand-500',
      'text-white',
      'hover:bg-brand-600',
      'cursor-pointer'
    );
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function CloseImportExportModal() {
  const modal = document.getElementById('import-export-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  backdrop.classList.remove('show');
  backdrop.classList.add('hide');
  content.classList.remove('show');
  content.classList.add('hide');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    backdrop.classList.remove('hide');
    content.classList.remove('hide');
    selected_import_file = null;
  }, 200);
}

async function ExportTasks() {
  try {
    const all_attachments = await database.GetAllAttachmentsFromDB();
    const boards = board_manager.GetAllBoards();
    const all_boards_data = [];
    for (const board of boards) {
      const board_tasks = await database.LoadTasksFromStorage(board.id);
      all_boards_data.push({
        board: board,
        tasks: board_tasks
      });
    }
    const export_data = {
      exported_at: new Date().toISOString(),
      boards: all_boards_data,
      attachments: all_attachments
    };
    const json_string = JSON.stringify(export_data, null, 2);
    const blob = new Blob([json_string], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
    const filename = `kanban-board-export-${timestamp}.json`;
    const download_link = document.createElement('a');
    download_link.href = url;
    download_link.download = filename;
    document.body.appendChild(download_link);
    download_link.click();
    document.body.removeChild(download_link);
    URL.revokeObjectURL(url);
    const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
    ShowNotification(t('import_export.export_success'), 'success');
  } catch (error) {
    console.error('Export error:', error);
    const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
    alert(t('import_export.export_error'));
  }
}

function HandleImportFileSelect(event) {
  const file = event.target.files[0];
  if (!file) {
    selected_import_file = null;
    return;
  }
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    alert('Please select a valid JSON file.');
    event.target.value = '';
    selected_import_file = null;
    return;
  }
  selected_import_file = file;
  const file_label = document.getElementById('import-file-label');
  const import_button = document.getElementById('import-button');
  if (file_label) {
    file_label.textContent = file.name;
  }
  if (import_button) {
    import_button.disabled = false;
    import_button.classList.remove(
      'bg-gray-300',
      'text-gray-500',
      'cursor-not-allowed',
      'dark:bg-gray-700',
      'dark:text-gray-500'
    );
    import_button.classList.add(
      'bg-brand-500',
      'text-white',
      'hover:bg-brand-600',
      'cursor-pointer'
    );
  }
}

async function ImportTasks() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  if (!selected_import_file) {
    alert(t('import_export.select_file'));
    return;
  }
  const import_mode =
    document.querySelector('input[name="import-mode"]:checked')?.value ||
    'merge';
  if (import_mode === 'replace') {
    const confirm_replace = confirm(
      'WARNING: This will permanently delete all existing boards and tasks and replace them with the imported data. This action cannot be undone.\n\nAre you sure you want to continue?'
    );
    if (!confirm_replace) {
      return;
    }
  }
  try {
    const file_content = await selected_import_file.text();
    const import_data = JSON.parse(file_content);
    if (
      import_data.attachments &&
      typeof import_data.attachments === 'object'
    ) {
      await database.ImportAttachmentsToDB(import_data.attachments);
    }
    let total_tasks = 0;
    if (import_data.boards && Array.isArray(import_data.boards)) {
      if (import_mode === 'replace') {
        board_manager.boards = [];
      }
      for (const board_data of import_data.boards) {
        const board = board_data.board;
        const tasks = board_data.tasks;
        const existing_board = board_manager.GetBoardById(board.id);
        if (!existing_board || import_mode === 'replace') {
          await board_manager.AddBoard(board);
        }
        await database.SaveTasksToCookie(tasks, board.id);
        total_tasks += tasks.length;
      }
      await board_manager.SaveBoards();
    } else {
      if (!import_data.tasks || !Array.isArray(import_data.tasks)) {
        throw new Error('Invalid file format. Missing tasks array.');
      }
      const imported_tasks = import_data.tasks.map(task => {
        if (!task.id || !task.title || !task.status) {
          throw new Error(
            'Invalid task data. Each task must have id, title, and status.'
          );
        }
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status,
          date: task.date || '',
          tags: task.tags || [],
          image: task.image || '',
          attachments: task.attachments || [],
          priority: task.priority || 0,
          task_priority: task.task_priority || 'medium',
          subtasks: task.subtasks || [],
          comments: task.comments || [],
          created_at: task.created_at || new Date().toISOString()
        };
      });
      const current_board_id = GetCurrentBoardId();
      if (import_mode === 'replace') {
        task_manager.tasks = imported_tasks;
      } else {
        const existing_ids = new Set(task_manager.tasks.map(t => t.id));
        const new_tasks = imported_tasks.filter(t => !existing_ids.has(t.id));
        task_manager.tasks = [...task_manager.tasks, ...new_tasks];
      }
      await database.SaveTasksToCookie(task_manager.tasks, current_board_id);
      total_tasks = imported_tasks.length;
    }
    const current_board = board_manager.GetCurrentBoard();
    await task_manager.LoadTasks(current_board?.id);
    ui_manager.RenderTasks();
    CloseImportExportModal();
    const has_attachments =
      import_data.attachments &&
      Object.keys(import_data.attachments).length > 0;
    const message = t('import_export.import_success')
      .replace('{count}', total_tasks)
      .replace(
        '{attachments}',
        has_attachments ? t('import_export.with_attachments') : ''
      );
    ShowNotification(message, 'success');
  } catch (error) {
    console.error('Import error:', error);
    alert(t('import_export.import_error').replace('{error}', error.message));
  }
}

function ShowNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-[100] rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
    type === 'success'
      ? 'bg-green-500 text-white'
      : type === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function SearchTasks() {
  const search_input = document.getElementById('search-input');
  task_manager.search_keyword = search_input.value;
  ui_manager.RenderTasks();
}

function ShowKeyboardShortcutsModal() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const modal_id = 'keyboard-shortcuts-modal';
  let modal = document.getElementById(modal_id);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modal_id;
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="modal-backdrop absolute inset-0 bg-black/50" onclick="CloseKeyboardShortcutsModal()"></div>
      <div class="modal-content relative w-full max-w-[600px] rounded-3xl bg-white p-6 shadow-xl lg:p-8 dark:bg-gray-900">
        <div class="px-2">
          <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">${t('shortcuts.title')}</h4>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">${t('shortcuts.description')}</p>
        </div>
        <button onclick="CloseKeyboardShortcutsModal()" class="absolute right-5 top-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 sm:h-11 sm:w-11 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-300">
          <svg class="h-5 w-5 fill-current sm:h-6 sm:w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill=""></path>
          </svg>
        </button>
        <div class="max-h-[450px] overflow-y-auto px-2" style="scrollbar-width: thin;">
          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <span class="text-sm text-gray-700 dark:text-gray-300">${t('shortcuts.create_task')}</span>
              <kbd class="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200">Ctrl + N</kbd>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <span class="text-sm text-gray-700 dark:text-gray-300">${t('shortcuts.search_tasks')}</span>
              <kbd class="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200">Ctrl + K</kbd>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <span class="text-sm text-gray-700 dark:text-gray-300">${t('shortcuts.save_task')}</span>
              <kbd class="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200">Ctrl + S</kbd>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <span class="text-sm text-gray-700 dark:text-gray-300">${t('shortcuts.close_modal')}</span>
              <kbd class="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200">Esc</kbd>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <span class="text-sm text-gray-700 dark:text-gray-300">${t('shortcuts.show_shortcuts')}</span>
              <kbd class="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-200">?</kbd>
            </div>
          </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-3 px-2">
          <button onclick="CloseKeyboardShortcutsModal()" class="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">${t('common.close')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function CloseKeyboardShortcutsModal() {
  const modal = document.getElementById('keyboard-shortcuts-modal');
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

function ToggleTheme() {
  theme_manager.ToggleTheme();
}

function ToggleLanguageMenu() {
  const dropdown = document.getElementById('language-menu-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

function ChangeLanguage(language_code) {
  if (i18n_manager) {
    i18n_manager.ChangeLanguage(language_code);
    UpdateLanguageCheckmarks();
  }
}

function UpdateLanguageCheckmarks() {
  const current_lang = i18n_manager.GetCurrentLanguage();
  document
    .getElementById('lang-en-check')
    .classList.toggle('hidden', current_lang !== 'en');
  document
    .getElementById('lang-th-check')
    .classList.toggle('hidden', current_lang !== 'th');
}

function ToggleMoreMenu() {
  const dropdown = document.getElementById('more-menu-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

document.addEventListener('click', e => {
  const menu_button = document.getElementById('more-menu-button');
  const dropdown = document.getElementById('more-menu-dropdown');
  if (
    dropdown &&
    menu_button &&
    !menu_button.contains(e.target) &&
    !dropdown.contains(e.target)
  ) {
    dropdown.classList.add('hidden');
  }

  const lang_button = document.getElementById('language-toggle');
  const lang_dropdown = document.getElementById('language-menu-dropdown');
  if (
    lang_dropdown &&
    lang_button &&
    !lang_button.contains(e.target) &&
    !lang_dropdown.contains(e.target)
  ) {
    lang_dropdown.classList.add('hidden');
  }
});

function OpenAnalyticsDashboard() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const stats = analytics_manager.GetTaskStatistics();
  const completion_rate = analytics_manager.GetCompletionRate();
  const productivity_score = analytics_manager.GetProductivityScore();
  const weekly_summary = analytics_manager.GetWeeklySummary();
  const most_used_tags = analytics_manager.GetMostUsedTags(5);
  const modal_html = `
    <div id="analytics-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="modal-backdrop absolute inset-0 bg-black/50" onclick="CloseAnalyticsDashboard()"></div>
      <div class="modal-content relative w-full max-w-[900px] rounded-3xl bg-white p-6 shadow-xl lg:p-8 dark:bg-gray-900">
        <div class="px-2">
          <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">${t('analytics.title')}</h4>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">${t('analytics.productivity')}</p>
        </div>
        <button onclick="CloseAnalyticsDashboard()" class="absolute right-5 top-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 sm:h-11 sm:w-11 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-300">
          <svg class="h-5 w-5 fill-current sm:h-6 sm:w-6" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"></path></svg>
        </button>
        <div class="max-h-[450px] overflow-y-auto px-2 space-y-6" style="scrollbar-width: thin;">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-lg border border-gray-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div class="text-sm font-medium text-blue-600 dark:text-blue-400">${t('analytics.total_tasks')}</div>
              <div class="text-3xl font-bold text-blue-700 dark:text-blue-300">${stats.total}</div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div class="text-sm font-medium text-green-600 dark:text-green-400">${t('analytics.completed_tasks')}</div>
              <div class="text-3xl font-bold text-green-700 dark:text-green-300">${stats.completed}</div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <div class="text-sm font-medium text-purple-600 dark:text-purple-400">${t('analytics.productivity')}</div>
              <div class="text-3xl font-bold text-purple-700 dark:text-purple-300">${productivity_score}/100</div>
            </div>
          </div>
          <!-- Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 class="mb-3 font-semibold text-gray-800 dark:text-white/90">${t('analytics.title')}</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.todo_tasks')}:</span><span class="font-medium text-blue-600">${stats.todo}</span></div>
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.in_progress_tasks')}:</span><span class="font-medium text-blue-600">${stats.in_progress}</span></div>
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.completed_tasks')}:</span><span class="font-medium text-blue-600">${stats.completed}</span></div>
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.overdue')}:</span><span class="font-medium text-red-600">${stats.overdue}</span></div>
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.completion_rate')}:</span><span class="font-medium text-green-600">${completion_rate}%</span></div>
              </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 class="mb-3 font-semibold text-gray-800 dark:text-white/90">${t('analytics.weekly_summary')}</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.tasks_created')}:</span><span class="font-medium text-blue-600">${weekly_summary.tasks_created}</span></div>
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.tasks_completed')}:</span><span class="font-medium text-blue-600">${weekly_summary.tasks_completed}</span></div>
                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${t('analytics.completion_rate')}:</span><span class="font-medium text-blue-600">${weekly_summary.completion_rate}%</span></div>
              </div>
            </div>
          </div>
          ${
            most_used_tags.length > 0
              ? `
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h5 class="mb-3 font-semibold text-gray-800 dark:text-white/90">${t('analytics.most_used_tags')}</h5>
            <div class="flex flex-wrap gap-2">
              ${most_used_tags.map(tag => `<span class="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">${tag.name} <span class="text-blue-500">(${tag.count})</span></span>`).join('')}
            </div>
          </div>
          `
              : ''
          }
        </div>
        <div class="mt-6 flex items-center justify-end gap-3 px-2">
          <button onclick="CloseAnalyticsDashboard()" class="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">${t('common.close')}</button>
        </div>
      </div>
    </div>
  `;
  const temp_div = document.createElement('div');
  temp_div.innerHTML = modal_html;
  document.body.appendChild(temp_div.firstElementChild);
  const modal = document.getElementById('analytics-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function CloseAnalyticsDashboard() {
  const modal = document.getElementById('analytics-modal');
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

function OpenBoardSelector() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const boards = board_manager.GetAllBoards();
  const current_board = board_manager.GetCurrentBoard();
  const boards_html = boards
    .map(
      board => `
    <div class="relative group rounded-lg border ${board.id === current_board?.id ? 'border-brand-500 bg-brand-500/5 dark:border-brand-500 dark:bg-brand-500/5' : 'border-gray-200 dark:border-gray-700'} hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
      <button
        onclick="SwitchBoard('${board.id}')"
        class="w-full text-left p-3 pr-12"
      >
        <div class="font-medium text-gray-800 dark:text-white/90">${board.name}</div>
        ${board.description ? `<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${board.description}</div>` : ''}
        <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">${board.columns.length} columns</div>
      </button>
      ${
        boards.length > 1 && !is_readonly_mode
          ? `
        <button
          onclick="DeleteBoard('${board.id}', event)"
          class="!absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10"
          title="Delete Board"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      `
          : ''
      }
    </div>
  `
    )
    .join('');
  const create_board_button = !is_readonly_mode
    ? `<button onclick="CreateNewBoard()" class="mt-4 w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400 dark:hover:bg-brand-500/5 transition-all duration-200">
          ${t('board.create_board')}
        </button>`
    : '';
  const modal_html = `
    <div id="board-selector-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="modal-backdrop absolute inset-0 bg-black/50" onclick="CloseBoardSelector()"></div>
      <div class="modal-content relative w-full max-w-[500px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
        <h4 class="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">${t('board.board_selector_title')}</h4>
        <button onclick="CloseBoardSelector()" class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.1] dark:hover:text-gray-300 transition-colors">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"/></svg>
        </button>
        <div class="space-y-2">
          ${boards_html}
        </div>
        ${create_board_button}
      </div>
    </div>
  `;
  const temp_div = document.createElement('div');
  temp_div.innerHTML = modal_html;
  document.body.appendChild(temp_div.firstElementChild);
  const modal = document.getElementById('board-selector-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function CloseBoardSelector() {
  const modal = document.getElementById('board-selector-modal');
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

async function SwitchBoard(board_id) {
  board_manager.SetCurrentBoard(board_id);
  const board = board_manager.GetBoardById(board_id);
  document.getElementById('current-board-name').textContent = board.name;
  CloseBoardSelector();
  await task_manager.LoadTasks(board_id);
  ui_manager.RenderTasks();
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  ShowNotification(
    `${t('notifications.board_updated')}: ${board.name}`,
    'success'
  );
}

async function CreateNewBoard() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  if (is_readonly_mode) {
    ShowNotification(t('share.readonly_mode'), 'error');
    return;
  }
  const name = prompt('Enter board name:');
  if (!name) return;
  const description = prompt('Enter board description (optional):') || '';
  const new_board = board_manager.CreateBoard(name, description);
  await board_manager.AddBoard(new_board);
  const boards = board_manager.GetAllBoards();
  const default_board = boards.find(
    b => b.name === 'My Board' && b.description === 'Default board'
  );
  if (default_board && boards.length > 1) {
    const tasks_in_default = task_manager.tasks.filter(
      t => localStorage.getItem('kanban_current_board') === default_board.id
    );
    if (tasks_in_default.length === 0) {
      if (confirm('Delete the default "My Board"?')) {
        await board_manager.DeleteBoard(default_board.id);
      }
    }
  }
  await SwitchBoard(new_board.id);
  CloseBoardSelector();
  setTimeout(() => {
    OpenBoardSelector();
  }, 100);
}

async function DeleteBoard(board_id, event) {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  event.stopPropagation();
  if (is_readonly_mode) {
    ShowNotification(t('share.readonly_mode'), 'error');
    return;
  }
  const boards = board_manager.GetAllBoards();
  if (boards.length <= 1) {
    ShowNotification(t('board.no_boards'), 'error');
    return;
  }
  const board = board_manager.GetBoardById(board_id);
  if (
    !confirm(
      `Delete board "${board.name}"? All tasks in this board will be lost.`
    )
  ) {
    return;
  }
  const current_board = board_manager.GetCurrentBoard();
  await board_manager.DeleteBoard(board_id);
  if (current_board.id === board_id) {
    const remaining_boards = board_manager.GetAllBoards();
    if (remaining_boards.length > 0) {
      await SwitchBoard(remaining_boards[0].id);
    }
  }
  CloseBoardSelector();
  setTimeout(() => {
    OpenBoardSelector();
  }, 100);
  ShowNotification(
    `${t('notifications.board_deleted')}: "${board.name}"`,
    'success'
  );
}

function OpenTemplatesManager() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const templates = template_manager.GetAllTemplates();
  const templates_html =
    templates.length > 0
      ? templates
          .map(
            template => `
    <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="font-medium text-gray-800 dark:text-white/90">${template.name}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${template.description.substring(0, 60)}${template.description.length > 60 ? '...' : ''}</div>
          <div class="flex gap-1 mt-2">
            ${template.tags.map(tag => `<span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">${tag.name}</span>`).join('')}
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="UseTemplate('${template.id}')" class="text-brand-500 hover:text-brand-600" title="${t('templates.use_template')}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
          <button onclick="DeleteTemplate('${template.id}')" class="text-red-500 hover:text-red-600" title="${t('common.delete')}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `
          )
          .join('')
      : `<p class="text-center text-gray-500 dark:text-gray-400 py-8">${t('templates.no_templates')}</p>`;
  const modal_html = `
    <div id="templates-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="modal-backdrop absolute inset-0 bg-black/50" onclick="CloseTemplatesManager()"></div>
      <div class="modal-content relative w-full max-w-[600px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h4 class="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">${t('templates.title')}</h4>
        <button onclick="CloseTemplatesManager()" class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.07]">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"/></svg>
        </button>
        <div class="max-h-[450px] overflow-y-auto px-2" style="scrollbar-width: thin;">
          <div class="space-y-3">
            ${templates_html}
          </div>
        </div>
      </div>
    </div>
  `;
  const temp_div = document.createElement('div');
  temp_div.innerHTML = modal_html;
  document.body.appendChild(temp_div.firstElementChild);
  const modal = document.getElementById('templates-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function CloseTemplatesManager() {
  const modal = document.getElementById('templates-modal');
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

async function UseTemplate(template_id) {
  const title = prompt('Enter task title:');
  if (!title) return;
  const today = new Date();
  const formatted_date = today.toISOString().split('T')[0];
  const task_data = template_manager.ApplyTemplate(
    template_id,
    title,
    'Todo',
    formatted_date
  );
  if (task_data) {
    const new_task = task_manager.CreateTask(
      task_data.title,
      task_data.description,
      task_data.status,
      task_data.date,
      task_data.tags,
      task_data.attachments,
      task_data.task_priority,
      task_data.subtasks,
      task_data.comments
    );
    await task_manager.AddTask(new_task);
    ui_manager.RenderTasks();
    CloseTemplatesManager();
    const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
    ShowNotification(t('notifications.task_created'), 'success');
  }
}

async function DeleteTemplate(template_id) {
  if (confirm('Delete this template?')) {
    await template_manager.DeleteTemplate(template_id);
    CloseTemplatesManager();
    setTimeout(() => {
      OpenTemplatesManager();
    }, 100);
    const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
    ShowNotification(t('notifications.template_saved'), 'success');
  }
}

function OpenRecurringTasksManager() {
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const recurring_tasks = recurring_task_manager.GetAllRecurringTasks();
  const tasks_html =
    recurring_tasks.length > 0
      ? recurring_tasks
          .map(rt => {
            const next_due = new Date(rt.next_due).toLocaleDateString();
            const type_labels = {
              daily: t('recurring.daily'),
              weekly: t('recurring.weekly'),
              monthly: t('recurring.monthly'),
              yearly: 'Yearly'
            };
            return `
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="font-medium text-gray-800 dark:text-white/90">${rt.task_template.title}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ${type_labels[rt.recurrence.type]} • Next: ${next_due}
            </div>
            <div class="mt-2">
              <span class="text-xs px-2 py-0.5 rounded ${rt.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}">
                ${rt.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="ToggleRecurringTask('${rt.id}')" class="text-blue-500 hover:text-blue-600" title="${rt.is_active ? 'Pause' : 'Resume'}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${rt.is_active ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
              </svg>
            </button>
            <button onclick="DeleteRecurringTask('${rt.id}')" class="text-red-500 hover:text-red-600" title="${t('common.delete')}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
          })
          .join('')
      : `<p class="text-center text-gray-500 dark:text-gray-400 py-8">${t('recurring.no_recurring')}</p>`;
  const modal_html = `
    <div id="recurring-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="modal-backdrop absolute inset-0 bg-black/50" onclick="CloseRecurringTasksManager()"></div>
      <div class="modal-content relative w-full max-w-[600px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h4 class="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">${t('recurring.title')}</h4>
        <button onclick="CloseRecurringTasksManager()" class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.07]">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"/></svg>
        </button>
        <div class="max-h-[450px] overflow-y-auto px-2" style="scrollbar-width: thin;">
          <div class="space-y-3">
            ${tasks_html}
          </div>
        </div>
      </div>
    </div>
  `;
  const temp_div = document.createElement('div');
  temp_div.innerHTML = modal_html;
  document.body.appendChild(temp_div.firstElementChild);
  const modal = document.getElementById('recurring-modal');
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal-content');
  setTimeout(() => {
    backdrop.classList.add('show');
    content.classList.add('show');
  }, 10);
}

function CloseRecurringTasksManager() {
  const modal = document.getElementById('recurring-modal');
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

async function ToggleRecurringTask(recurring_id) {
  await recurring_task_manager.ToggleRecurringTask(recurring_id);
  CloseRecurringTasksManager();
  setTimeout(() => {
    OpenRecurringTasksManager();
  }, 100);
}

async function DeleteRecurringTask(recurring_id) {
  if (confirm('Delete this recurring task?')) {
    await recurring_task_manager.DeleteRecurringTask(recurring_id);
    CloseRecurringTasksManager();
    setTimeout(() => {
      OpenRecurringTasksManager();
    }, 100);
    const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
    ShowNotification(t('notifications.recurring_created'), 'success');
  }
}

async function SaveTaskAsTemplate(task_id) {
  const task = task_manager.GetTaskById(task_id);
  if (!task) return;
  const template_name = prompt('Enter template name:', task.title);
  if (!template_name) return;
  const template = template_manager.CreateTemplate(template_name, task);
  await template_manager.AddTemplate(template);
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  ShowNotification(t('notifications.template_saved'), 'success');
}

function CreateRecurringTaskFromCurrent(task_id) {
  const task = task_manager.GetTaskById(task_id);
  if (!task) return;
  const type = prompt(
    'Recurrence type (daily/weekly/monthly/yearly):',
    'daily'
  );
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  if (!type || !['daily', 'weekly', 'monthly', 'yearly'].includes(type)) {
    ShowNotification(t('errors.invalid_task_data'), 'error');
    return;
  }
  const interval = parseInt(
    prompt('Interval (e.g., 1 for every day, 2 for every 2 days):', '1')
  );
  if (!interval || interval < 1) {
    ShowNotification(t('errors.invalid_task_data'), 'error');
    return;
  }
  const recurrence_pattern = {
    type: type,
    interval: interval,
    days_of_week: [],
    day_of_month: null,
    end_date: null
  };
  const recurring_task = recurring_task_manager.CreateRecurringTask(
    task,
    recurrence_pattern
  );
  recurring_task_manager.AddRecurringTask(recurring_task);
  ShowNotification(t('notifications.recurring_created'), 'success');
}

function AddTaskCardButtons(task_id) {
  const task_card = document.querySelector(`[data-task-id="${task_id}"]`);
  if (!task_card) return;
  if (task_card.querySelector('.task-action-buttons')) return;
  const t = key => (i18n_manager ? i18n_manager.Translate(key) : key);
  const buttons_html = `
    <div class="task-action-buttons mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
      <button onclick="SaveTaskAsTemplate('${task_id}')" class="text-xs text-blue-500 hover:text-blue-600" title="Save as Template">
        📋 ${t('templates.title')}
      </button>
      <button onclick="CreateRecurringTaskFromCurrent('${task_id}')" class="text-xs text-purple-500 hover:text-purple-600" title="Make Recurring">
        🔁 ${t('recurring.title')}
      </button>
    </div>
  `;
  const content_div = task_card.querySelector('.task-content');
  if (content_div) {
    content_div.insertAdjacentHTML('beforeend', buttons_html);
  }
}
