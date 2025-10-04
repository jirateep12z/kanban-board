const TRANSLATIONS_EN = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },

  // Header
  header: {
    board_selector: 'Switch Board',
    current_board: 'My Board',
    add_task: 'Add Task',
    search_placeholder: 'Search tasks...',
    theme_toggle: 'Toggle Theme',
    more_menu: 'More Options'
  },

  // Task Status
  status: {
    todo: 'Todo',
    in_progress: 'In Progress',
    completed: 'Completed',
    all: 'All'
  },

  // Task Priority
  priority: {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },

  // Task Modal
  task_modal: {
    add_title: 'Add a new task',
    add_task_description: 'Effortlessly manage your to-do list: add a new task',
    edit_title: 'Edit task',
    task_title: 'Task Title',
    task_title_placeholder: 'Enter task title...',
    task_description: 'Description',
    task_description_placeholder:
      'Enter task description (Markdown supported)...',
    task_status: 'Status',
    task_date: 'Due Date',
    task_priority: 'Priority',
    task_tags: 'Tags',
    task_image: 'Cover Image',
    task_attachments: 'Attachments',
    task_subtasks: 'Subtasks',
    task_comments: 'Comments',
    create_task: 'Create Task',
    update_task: 'Update Task',
    delete_confirm: 'Delete this task?',
    choose_file: 'Choose File',
    choose_json_file: 'Choose JSON File',
    no_attachments: 'No attachments yet',
    no_tags: 'No tags yet',
    no_subtasks: 'No subtasks yet',
    no_comments: 'No comments yet',
    add_tag: 'Add Tag',
    tag_name: 'Tag Name',
    tag_color: 'Tag Color',
    add_subtask: 'Add Subtask',
    subtask_placeholder: 'Enter subtask...',
    add_comment: 'Add Comment',
    comment_placeholder: 'Enter comment...',
    upload_image: 'Upload Image',
    upload_files: 'Upload Files',
    remove_image: 'Remove Image',
    image_preview: 'Image Preview',
    save_as_template: 'Save as Template',
    make_recurring: 'Make Recurring'
  },

  // Filters
  filters: {
    filter_by: 'Filter By',
    sort_by: 'Sort By',
    date_filter: 'Date Filter',
    tag_filter: 'Tag Filter',
    all_tags: 'All Tags',
    reset_filters: 'Reset Filters',
    apply_filters: 'Apply Filters',
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    this_month: 'This Month',
    this_year: 'This Year',
    custom_date: 'Custom Date',
    all_dates: 'All Dates'
  },

  // Sort Options
  sort: {
    created_desc: 'Created (Newest)',
    created_asc: 'Created (Oldest)',
    title_asc: 'Title (A-Z)',
    title_desc: 'Title (Z-A)',
    date_asc: 'Due Date (Earliest)',
    date_desc: 'Due Date (Latest)',
    priority: 'Priority'
  },

  // Board Management
  board: {
    board_selector_title: 'Board Selector',
    create_board: 'Create New Board',
    edit_board: 'Edit Board',
    delete_board: 'Delete Board',
    board_name: 'Board Name',
    board_description: 'Board Description',
    board_name_placeholder: 'Enter board name...',
    board_description_placeholder: 'Enter board description...',
    delete_confirm:
      'Are you sure you want to delete this board? All tasks in this board will be deleted.',
    no_boards: 'No boards found. Please create a board.'
  },

  // Share
  share: {
    share_board_title: 'Share Board',
    share_board: 'Share Board',
    share_link: 'Share Link',
    share_url: 'Share URL',
    copy_url: 'Copy URL',
    copy_button: 'Copy',
    copied: 'Copied!',
    share_description:
      'Share your Kanban Board with others in a read-only format.',
    readonly_mode: 'Read-Only Mode',
    readonly_description:
      'You are viewing a shared board. You cannot edit, add, or delete tasks.',
    cannot_load: 'Cannot load data from share link',
    cannot_create: 'Cannot create share link. Please try again.',
    url_too_long:
      'Warning: Share URL is very long. Some browsers may have issues with this URL.',
    note_readonly: 'This link will display the board in read-only mode.',
    note_no_server: 'The data will not be stored on the server.',
    note_no_edit:
      'The person receiving the link will not be able to edit or delete tasks.',
    note_no_attachments: 'Images and attachments will NOT be shared',
    note_no_attachments_detail: 'to keep URL size manageable.',
    note_only_basic:
      'Only task titles, descriptions, tags, dates, and status will be shared.'
  },

  // Import/Export
  import_export: {
    import_export_title: 'Import / Export',
    export_data: 'Export Data',
    import_data: 'Import Data',
    export_description: 'Export all boards and tasks to a JSON file',
    import_description: 'Import boards and tasks from a JSON file',
    export_button: 'Export to JSON',
    import_button: 'Import from JSON',
    import_mode: 'Import Mode',
    merge_mode: 'Merge with existing data',
    replace_mode: 'Replace all existing data',
    replace_warning:
      'WARNING: This will permanently delete all existing boards and tasks and replace them with the imported data. This action cannot be undone.\n\nAre you sure you want to continue?',
    export_success: 'Export successful! All boards and tasks exported.',
    import_success: 'Import successful! {count} task(s) imported{attachments}.',
    with_attachments: ' with attachments',
    export_error: 'Failed to export tasks. Please try again.',
    import_error: 'Failed to import tasks: {error}',
    invalid_file: 'Please select a valid JSON file.',
    select_file: 'Please select a file to import.',
    note_all_data:
      'Exported files contain all task data including titles, descriptions, tags, dates, attachments, and images.',
    note_base64:
      'All attachments and images are included in the export as Base64 encoded data.',
    note_valid_file:
      'When importing, make sure the JSON file was exported from this Kanban Board application.',
    note_replace_warning:
      '"Replace" mode will permanently delete all existing tasks before importing.',
    note_large_files: 'Large files may result in bigger export file sizes.'
  },

  // Edit Mode
  edit_mode: {
    toggle_edit: 'Toggle Edit Mode',
    read_mode: 'Read Mode',
    edit_mode: 'Edit Mode'
  },

  // Keyboard Shortcuts
  shortcuts: {
    title: 'Keyboard Shortcuts',
    description: 'Use these shortcuts to navigate faster',
    create_task: 'Create new task',
    search_tasks: 'Search tasks',
    save_task: 'Save task (in modal)',
    close_modal: 'Close modal',
    show_shortcuts: 'Show shortcuts'
  },

  // Notifications
  notifications: {
    task_created: 'Task created successfully',
    task_updated: 'Task updated successfully',
    task_deleted: 'Task deleted successfully',
    board_created: 'Board created successfully',
    board_updated: 'Board updated successfully',
    board_deleted: 'Board deleted successfully',
    template_saved: 'Template saved successfully',
    recurring_created: 'Recurring task created successfully',
    error_occurred: 'An error occurred. Please try again.'
  },

  // Subtasks
  subtasks: {
    title: 'Subtasks',
    completed: 'Completed',
    more: 'more...'
  },

  // Comments
  comments: {
    title: 'Comments',
    comment: 'Comment',
    comments_count: '{count} Comment{plural}',
    view_all: 'View all {count} comments →',
    latest_comment: 'Latest comment'
  },

  // Attachments
  attachments: {
    title: 'Attachments',
    preview: 'Preview',
    download: 'Download',
    remove: 'Remove',
    file_size: 'File Size',
    file_type: 'File Type'
  },

  // Date Format
  date: {
    format: 'MMM DD, YYYY',
    time_format: 'MMM DD, HH:mm',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow'
  },

  // Errors
  errors: {
    image_too_large:
      'Image too large! Please use an image smaller than {size}MB',
    file_too_large:
      'File "{name}" is too large! Please use a file smaller than {size}MB',
    max_files_exceeded: 'You can only upload up to {max} files',
    invalid_file_type: 'Please select an image file',
    read_file_error: 'Error reading file',
    tag_exists: 'Tag already exists!',
    invalid_json: 'Invalid file format. Missing tasks array.',
    invalid_task_data:
      'Invalid task data. Each task must have id, title, and status.',
    no_board: 'No board found. Please create a board before sharing.',
    tasks_not_found: 'Tasks not found. Please try again.',
    element_not_found: 'Element for displaying URL not found.',
    modal_not_found: 'Modal for sharing not found.',
    modal_incomplete: 'Modal is incomplete.'
  },

  // Templates
  templates: {
    title: 'Template',
    save_template: 'Save as Template',
    use_template: 'Use Template',
    template_name: 'Template Name',
    no_templates: 'No templates found'
  },

  // Recurring Tasks
  recurring: {
    title: 'Recurring Tasks',
    create_recurring: 'Create Recurring Task',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    no_recurring: 'No recurring tasks found'
  },

  // Analytics
  analytics: {
    title: 'Analytics',
    total_tasks: 'Total Tasks',
    completed_tasks: 'Completed Tasks',
    in_progress_tasks: 'In Progress Tasks',
    todo_tasks: 'Todo Tasks',
    completion_rate: 'Completion Rate',
    productivity: 'Productivity',
    weekly_summary: 'Weekly Summary',
    tasks_created: 'Tasks Created',
    tasks_completed: 'Tasks Completed',
    most_used_tags: 'Most Used Tags',
    overdue: 'Overdue'
  },

  // Theme
  theme: {
    light: 'Light Mode',
    dark: 'Dark Mode',
    auto: 'Auto'
  },

  // Language
  language: {
    title: 'Language',
    english: 'English',
    thai: 'ไทย',
    select_language: 'Select Language'
  }
};
