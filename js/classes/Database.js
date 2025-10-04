class Database {
  constructor() {
    this.DB_NAME = 'kanban_db';
    this.DB_VERSION = 1;
    this.ATTACHMENTS_STORE = 'task_attachments';
    this.COOKIE_NAME = 'kanban_tasks';
    this.COOKIE_EXPIRY_DAYS = 365;
    this.db = null;
  }

  // Initialize IndexedDB
  async InitDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = event => {
        const db = event.target.result;
        const old_version = event.oldVersion;
        console.log(
          `Upgrading database from version ${old_version} to ${this.DB_VERSION}`
        );
        if (!db.objectStoreNames.contains(this.ATTACHMENTS_STORE)) {
          db.createObjectStore(this.ATTACHMENTS_STORE, {
            keyPath: 'task_id'
          });
        }
      };
    });
  }

  // Save attachments to IndexedDB
  async SaveAttachmentsToDB(task_id, attachments) {
    if (!this.db) await this.InitDB();
    if (!attachments || attachments.length === 0) {
      return this.DeleteAttachmentsFromDB(task_id);
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.ATTACHMENTS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.ATTACHMENTS_STORE);
      const request = store.put({ task_id, attachments });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get attachments from IndexedDB
  async GetAttachmentsFromDB(task_id) {
    if (!this.db) await this.InitDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.ATTACHMENTS_STORE],
        'readonly'
      );
      const store = transaction.objectStore(this.ATTACHMENTS_STORE);
      const request = store.get(task_id);
      request.onsuccess = () => {
        resolve(request.result?.attachments || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Delete attachments from IndexedDB
  async DeleteAttachmentsFromDB(task_id) {
    if (!this.db) await this.InitDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.ATTACHMENTS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.ATTACHMENTS_STORE);
      const request = store.delete(task_id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cookie Management
  SetCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie =
      name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/';
  }

  GetCookie(name) {
    const cookie_name = name + '=';
    const decoded_cookie = decodeURIComponent(document.cookie);
    const cookie_array = decoded_cookie.split(';');
    for (let i = 0; i < cookie_array.length; i++) {
      let cookie = cookie_array[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookie_name) === 0) {
        return cookie.substring(cookie_name.length, cookie.length);
      }
    }
    return '';
  }

  // Save tasks to Cookie (without attachments)
  async SaveTasksToCookie(tasks, board_id = null) {
    try {
      for (const task of tasks) {
        if (task.attachments && task.attachments.length > 0) {
          await this.SaveAttachmentsToDB(task.id, task.attachments);
        }
      }
      const tasks_without_binary = tasks.map(task => {
        const { attachments, ...task_data } = task;
        return {
          ...task_data,
          has_attachments: !!(attachments && attachments.length > 0)
        };
      });
      const tasks_json = JSON.stringify(tasks_without_binary);
      const cookie_name = board_id
        ? `kanban_tasks_${board_id}`
        : this.COOKIE_NAME;
      this.SetCookie(cookie_name, tasks_json, this.COOKIE_EXPIRY_DAYS);
    } catch (e) {
      console.error('Error saving tasks:', e);
      alert('Failed to save tasks.');
    }
  }

  // Load tasks from Cookie and IndexedDB
  async LoadTasksFromStorage(board_id = null) {
    try {
      const cookie_name = board_id
        ? `kanban_tasks_${board_id}`
        : this.COOKIE_NAME;
      const tasks_json = this.GetCookie(cookie_name);
      if (!tasks_json) return [];
      const tasks = JSON.parse(tasks_json);
      for (const task of tasks) {
        if (task.has_attachments) {
          const attachments = await this.GetAttachmentsFromDB(task.id);
          task.attachments = attachments || [];
        } else {
          task.attachments = [];
        }
        delete task.has_attachments;
        if (!task.image) {
          task.image = '';
        }
      }
      return tasks;
    } catch (e) {
      console.error('Error loading tasks:', e);
      return [];
    }
  }

  // Get all attachments from IndexedDB
  async GetAllAttachmentsFromDB() {
    if (!this.db) await this.InitDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.ATTACHMENTS_STORE],
        'readonly'
      );
      const store = transaction.objectStore(this.ATTACHMENTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const all_attachments = {};
        request.result.forEach(item => {
          all_attachments[item.task_id] = item.attachments;
        });
        resolve(all_attachments);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Import attachments to IndexedDB
  async ImportAttachmentsToDB(attachments_data) {
    if (!this.db) await this.InitDB();
    const transaction = this.db.transaction(
      [this.ATTACHMENTS_STORE],
      'readwrite'
    );
    const store = transaction.objectStore(this.ATTACHMENTS_STORE);
    for (const task_id in attachments_data) {
      await new Promise((resolve, reject) => {
        const request = store.put({
          task_id,
          attachments: attachments_data[task_id]
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}
