const TRANSLATIONS_TH = {
  // Common
  common: {
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    delete: 'ลบ',
    edit: 'แก้ไข',
    add: 'เพิ่ม',
    search: 'ค้นหา',
    filter: 'กรอง',
    sort: 'เรียง',
    all: 'ทั้งหมด',
    yes: 'ใช่',
    no: 'ไม่',
    confirm: 'ยืนยัน',
    loading: 'กำลังโหลด...',
    error: 'ข้อผิดพลาด',
    success: 'สำเร็จ',
    warning: 'คำเตือน',
    info: 'ข้อมูล'
  },

  // Header
  header: {
    board_selector: 'เปลี่ยนบอร์ด',
    current_board: 'บอร์ดของฉัน',
    add_task: 'เพิ่มงาน',
    search_placeholder: 'ค้นหางาน...',
    theme_toggle: 'สลับธีม',
    more_menu: 'ตัวเลือกเพิ่มเติม'
  },

  // Task Status
  status: {
    todo: 'รอดำเนินการ',
    in_progress: 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น',
    all: 'ทั้งหมด'
  },

  // Task Priority
  priority: {
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ'
  },

  // Task Modal
  task_modal: {
    add_title: 'เพิ่มงานใหม่',
    add_task_description: 'จัดการรายการงานของคุณได้อย่างง่ายดาย: เพิ่มงานใหม่',
    edit_title: 'แก้ไขงาน',
    task_title: 'ชื่องาน',
    task_title_placeholder: 'กรอกชื่องาน...',
    task_description: 'รายละเอียด',
    task_description_placeholder: 'กรอกรายละเอียดงาน (รองรับ Markdown)...',
    task_status: 'สถานะ',
    task_date: 'วันครบกำหนด',
    task_priority: 'ความสำคัญ',
    task_tags: 'แท็ก',
    task_image: 'รูปภาพหน้าปก',
    task_attachments: 'ไฟล์แนบ',
    task_subtasks: 'งานย่อย',
    task_comments: 'ความคิดเห็น',
    create_task: 'สร้างงาน',
    update_task: 'อัพเดทงาน',
    delete_confirm: 'ลบงานนี้หรือไม่?',
    choose_file: 'เลือกไฟล์',
    choose_json_file: 'เลือกไฟล์ JSON',
    no_attachments: 'ยังไม่มีไฟล์แนบ',
    no_tags: 'ยังไม่มีแท็ก',
    no_subtasks: 'ยังไม่มีงานย่อย',
    no_comments: 'ยังไม่มีความคิดเห็น',
    add_tag: 'เพิ่มแท็ก',
    tag_name: 'ชื่อแท็ก',
    tag_color: 'สีแท็ก',
    add_subtask: 'เพิ่มงานย่อย',
    subtask_placeholder: 'กรอกงานย่อย...',
    add_comment: 'เพิ่มความคิดเห็น',
    comment_placeholder: 'กรอกความคิดเห็น...',
    upload_image: 'อัพโหลดรูปภาพ',
    upload_files: 'อัพโหลดไฟล์',
    remove_image: 'ลบรูปภาพ',
    image_preview: 'ตัวอย่างรูปภาพ',
    save_as_template: 'บันทึกเป็นเทมเพลต',
    make_recurring: 'ทำซ้ำอัตโนมัติ'
  },

  // Filters
  filters: {
    filter_by: 'กรองตาม',
    sort_by: 'เรียงตาม',
    date_filter: 'กรองวันที่',
    tag_filter: 'กรองแท็ก',
    all_tags: 'แท็กทั้งหมด',
    reset_filters: 'รีเซ็ตตัวกรอง',
    apply_filters: 'ใช้ตัวกรอง',
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
    this_week: 'สัปดาห์นี้',
    this_month: 'เดือนนี้',
    this_year: 'ปีนี้',
    custom_date: 'กำหนดเอง',
    all_dates: 'ทุกวันที่'
  },

  // Sort Options
  sort: {
    created_desc: 'สร้างล่าสุด',
    created_asc: 'สร้างเก่าสุด',
    title_asc: 'ชื่อ (ก-ฮ)',
    title_desc: 'ชื่อ (ฮ-ก)',
    date_asc: 'วันครบกำหนด (เร็วสุด)',
    date_desc: 'วันครบกำหนด (ช้าสุด)',
    priority: 'ความสำคัญ'
  },

  // Board Management
  board: {
    board_selector_title: 'เลือกบอร์ด',
    create_board: 'สร้างบอร์ดใหม่',
    edit_board: 'แก้ไขบอร์ด',
    delete_board: 'ลบบอร์ด',
    board_name: 'ชื่อบอร์ด',
    board_description: 'รายละเอียดบอร์ด',
    board_name_placeholder: 'กรอกชื่อบอร์ด...',
    board_description_placeholder: 'กรอกรายละเอียดบอร์ด...',
    delete_confirm:
      'คุณแน่ใจหรือไม่ว่าต้องการลบบอร์ดนี้? งานทั้งหมดในบอร์ดนี้จะถูกลบด้วย',
    no_boards: 'ไม่พบบอร์ด กรุณาสร้างบอร์ด'
  },

  // Share
  share: {
    share_board_title: 'แชร์บอร์ด',
    share_board: 'แชร์บอร์ด',
    share_link: 'ลิงก์แชร์',
    share_url: 'ลิงก์แชร์',
    copy_url: 'คัดลอกลิงก์',
    copy_button: 'คัดลอก',
    copied: 'คัดลอกแล้ว!',
    share_description: 'แชร์บอร์ดกับผู้อื่นในโหมดอ่านอย่างเดียว',
    readonly_mode: 'โหมดอ่านอย่างเดียว',
    readonly_description:
      'คุณกำลังดูบอร์ดที่ถูกแชร์ คุณไม่สามารถแก้ไข เพิ่ม หรือลบงานได้',
    cannot_load: 'ไม่สามารถโหลดข้อมูลจากลิงก์แชร์',
    cannot_create: 'ไม่สามารถสร้างลิงก์แชร์ กรุณาลองใหม่อีกครั้ง',
    url_too_long:
      'คำเตือน: ลิงก์แชร์ยาวมาก บราวเซอร์บางตัวอาจมีปัญหากับ URL นี้',
    note_readonly: 'ลิงก์นี้จะแสดงบอร์ดในโหมดอ่านอย่างเดียว',
    note_no_server: 'ข้อมูลจะไม่ถูกเก็บไว้บนเซิร์ฟเวอร์',
    note_no_edit: 'ผู้ที่ได้รับลิงก์จะไม่สามารถแก้ไขหรือลบงานได้',
    note_no_attachments: 'รูปภาพและไฟล์แนบจะไม่ถูกแชร์',
    note_no_attachments_detail: 'เพื่อให้ขนาด URL จัดการได้',
    note_only_basic: 'จะแชร์เฉพาะชื่องาน คำอธิบาย แท็ก วันที่ และสถานะเท่านั้น'
  },

  // Import/Export
  import_export: {
    import_export_title: 'นำเข้า / ส่งออก',
    export_data: 'ส่งออกข้อมูล',
    import_data: 'นำเข้าข้อมูล',
    export_description: 'ส่งออกบอร์ดและงานทั้งหมดเป็นไฟล์ JSON',
    import_description: 'นำเข้าบอร์ดและงานจากไฟล์ JSON',
    export_button: 'ส่งออกเป็น JSON',
    import_button: 'นำเข้าจาก JSON',
    import_mode: 'โหมดการนำเข้า',
    merge_mode: 'รวมกับข้อมูลที่มีอยู่',
    replace_mode: 'แทนที่ข้อมูลทั้งหมด',
    replace_warning:
      'คำเตือน: การดำเนินการนี้จะลบบอร์ดและงานทั้งหมดที่มีอยู่และแทนที่ด้วยข้อมูลที่นำเข้า การดำเนินการนี้ไม่สามารถยกเลิกได้\n\nคุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    export_success: 'ส่งออกสำเร็จ! ส่งออกบอร์ดและงานทั้งหมดแล้ว',
    import_success: 'นำเข้าสำเร็จ! นำเข้า {count} งาน{attachments}',
    with_attachments: ' พร้อมไฟล์แนบ',
    export_error: 'ไม่สามารถส่งออกงาน กรุณาลองใหม่อีกครั้ง',
    import_error: 'ไม่สามารถนำเข้างาน: {error}',
    invalid_file: 'กรุณาเลือกไฟล์ JSON ที่ถูกต้อง',
    select_file: 'กรุณาเลือกไฟล์เพื่อนำเข้า',
    note_all_data:
      'ไฟล์ที่ส่งออกจะมีข้อมูลงานทั้งหมด รวมถึงชื่อ คำอธิบาย แท็ก วันที่ ไฟล์แนบ และรูปภาพ',
    note_base64: 'ไฟล์แนบและรูปภาพทั้งหมดจะถูกรวมในการส่งออกเป็นข้อมูล Base64',
    note_valid_file:
      'เมื่อนำเข้า ตรวจสอบให้แน่ใจว่าไฟล์ JSON ถูกส่งออกจากแอพพลิเคชัน Kanban Board นี้',
    note_replace_warning: 'โหมด "แทนที่" จะลบงานที่มีอยู่ทั้งหมดก่อนนำเข้า',
    note_large_files: 'ไฟล์ขนาดใหญ่อาจทำให้ไฟล์ส่งออกมีขนาดใหญ่ขึ้น'
  },

  // Edit Mode
  edit_mode: {
    toggle_edit: 'สลับโหมดแก้ไข',
    read_mode: 'โหมดอ่าน',
    edit_mode: 'โหมดแก้ไข'
  },

  // Keyboard Shortcuts
  shortcuts: {
    title: 'แป้นพิมพ์ลัด',
    description: 'ใช้แป้นพิมพ์ลัดเหล่านี้เพื่อนำทางได้เร็วขึ้น',
    create_task: 'สร้างงานใหม่',
    search_tasks: 'ค้นหางาน',
    save_task: 'บันทึกงาน (ในหน้าต่าง)',
    close_modal: 'ปิดหน้าต่าง',
    show_shortcuts: 'แสดงแป้นพิมพ์ลัด'
  },

  // Notifications
  notifications: {
    task_created: 'สร้างงานสำเร็จ',
    task_updated: 'อัพเดทงานสำเร็จ',
    task_deleted: 'ลบงานสำเร็จ',
    board_created: 'สร้างบอร์ดสำเร็จ',
    board_updated: 'อัพเดทบอร์ดสำเร็จ',
    board_deleted: 'ลบบอร์ดสำเร็จ',
    template_saved: 'บันทึกเทมเพลตสำเร็จ',
    recurring_created: 'สร้างงานซ้ำอัตโนมัติสำเร็จ',
    error_occurred: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
  },

  // Subtasks
  subtasks: {
    title: 'งานย่อย',
    completed: 'เสร็จสิ้น',
    more: 'เพิ่มเติม...'
  },

  // Comments
  comments: {
    title: 'ความคิดเห็น',
    comment: 'ความคิดเห็น',
    comments_count: '{count} ความคิดเห็น',
    view_all: 'ดูทั้งหมด {count} ความคิดเห็น →',
    latest_comment: 'ความคิดเห็นล่าสุด'
  },

  // Attachments
  attachments: {
    title: 'ไฟล์แนบ',
    preview: 'ดูตัวอย่าง',
    download: 'ดาวน์โหลด',
    remove: 'ลบ',
    file_size: 'ขนาดไฟล์',
    file_type: 'ประเภทไฟล์'
  },

  // Date Format
  date: {
    format: 'DD MMM YYYY',
    time_format: 'DD MMM, HH:mm',
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
    tomorrow: 'พรุ่งนี้'
  },

  // Errors
  errors: {
    image_too_large:
      'รูปภาพใหญ่เกินไป! กรุณาใช้รูปภาพที่มีขนาดเล็กกว่า {size}MB',
    file_too_large:
      'ไฟล์ "{name}" ใหญ่เกินไป! กรุณาใช้ไฟล์ที่มีขนาดเล็กกว่า {size}MB',
    max_files_exceeded: 'คุณสามารถอัพโหลดได้สูงสุด {max} ไฟล์',
    invalid_file_type: 'กรุณาเลือกไฟล์รูปภาพ',
    read_file_error: 'เกิดข้อผิดพลาดในการอ่านไฟล์',
    tag_exists: 'แท็กนี้มีอยู่แล้ว!',
    invalid_json: 'รูปแบบไฟล์ไม่ถูกต้อง ไม่พบอาร์เรย์ของงาน',
    invalid_task_data:
      'ข้อมูลงานไม่ถูกต้อง งานแต่ละรายการต้องมี id, title และ status',
    no_board: 'ไม่พบบอร์ด กรุณาสร้างบอร์ดก่อนแชร์',
    tasks_not_found: 'ไม่พบงาน กรุณาลองใหม่อีกครั้ง',
    element_not_found: 'ไม่พบองค์ประกอบสำหรับแสดง URL',
    modal_not_found: 'ไม่พบหน้าต่างสำหรับแชร์',
    modal_incomplete: 'หน้าต่างไม่สมบูรณ์'
  },

  // Templates
  templates: {
    title: 'เทมเพลต',
    save_template: 'บันทึกเป็นเทมเพลต',
    use_template: 'ใช้เทมเพลต',
    template_name: 'ชื่อเทมเพลต',
    no_templates: 'ไม่พบเทมเพลต'
  },

  // Recurring Tasks
  recurring: {
    title: 'งานซ้ำอัตโนมัติ',
    create_recurring: 'สร้างงานซ้ำอัตโนมัติ',
    frequency: 'ความถี่',
    daily: 'รายวัน',
    weekly: 'รายสัปดาห์',
    monthly: 'รายเดือน',
    no_recurring: 'ไม่พบงานซ้ำอัตโนมัติ'
  },

  // Analytics
  analytics: {
    title: 'การวิเคราะห์',
    total_tasks: 'งานทั้งหมด',
    completed_tasks: 'งานที่เสร็จสิ้น',
    in_progress_tasks: 'งานที่กำลังดำเนินการ',
    todo_tasks: 'งานที่รอดำเนินการ',
    completion_rate: 'อัตราความสำเร็จ',
    productivity: 'ผลิตภาพ',
    weekly_summary: 'สรุปรายสัปดาห์',
    tasks_created: 'งานที่สร้าง',
    tasks_completed: 'งานที่เสร็จสิ้น',
    most_used_tags: 'แท็กที่ใช้บ่อย',
    overdue: 'เกินกำหนด'
  },

  // Theme
  theme: {
    light: 'โหมดสว่าง',
    dark: 'โหมดมืด',
    auto: 'อัตโนมัติ'
  },

  // Language
  language: {
    title: 'ภาษา',
    english: 'English',
    thai: 'ไทย',
    select_language: 'เลือกภาษา'
  }
};
