class BoardManager {
  constructor(database) {
    this.database = database;
    this.boards = [];
    this.current_board_id = null;
    this.BOARDS_COOKIE_NAME = 'kanban_boards';
  }

  // Generate unique board ID
  GenerateBoardId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Create new board
  CreateBoard(name, description = '', columns = null) {
    const default_columns = [
      { id: 'todo', name: 'To Do', color: 'gray', order: 0 },
      { id: 'inprogress', name: 'In Progress', color: 'yellow', order: 1 },
      { id: 'completed', name: 'Completed', color: 'green', order: 2 }
    ];
    return {
      id: this.GenerateBoardId(),
      name: name,
      description: description || '',
      columns: columns || default_columns,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Add board
  async AddBoard(board) {
    this.boards.push(board);
    await this.SaveBoards();
    return board;
  }

  // Update board
  async UpdateBoard(board_id, updates) {
    const board_index = this.boards.findIndex(b => b.id === board_id);
    if (board_index !== -1) {
      this.boards[board_index] = {
        ...this.boards[board_index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      await this.SaveBoards();
      return this.boards[board_index];
    }
    return null;
  }

  // Delete board
  async DeleteBoard(board_id) {
    this.boards = this.boards.filter(b => b.id !== board_id);
    await this.SaveBoards();
    const tasks_key = `kanban_tasks_${board_id}`;
    this.database.SetCookie(tasks_key, '', -1);
  }

  // Get board by ID
  GetBoardById(board_id) {
    return this.boards.find(b => b.id === board_id);
  }

  // Get all boards
  GetAllBoards() {
    return this.boards.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );
  }

  // Set current board
  SetCurrentBoard(board_id) {
    this.current_board_id = board_id;
    localStorage.setItem('kanban_current_board', board_id);
  }

  // Get current board
  GetCurrentBoard() {
    if (!this.current_board_id && this.boards.length > 0) {
      this.current_board_id = this.boards[0].id;
    }
    return this.GetBoardById(this.current_board_id);
  }

  // Save boards to cookie
  async SaveBoards() {
    try {
      const boards_json = JSON.stringify(this.boards);
      this.database.SetCookie(
        this.BOARDS_COOKIE_NAME,
        boards_json,
        this.database.COOKIE_EXPIRY_DAYS
      );
    } catch (e) {
      console.error('Error saving boards:', e);
      throw e;
    }
  }

  // Load boards from cookie
  async LoadBoards() {
    try {
      const boards_json = this.database.GetCookie(this.BOARDS_COOKIE_NAME);
      if (!boards_json) {
        const default_board = this.CreateBoard('My Board', 'Default board');
        this.boards = [default_board];
        this.current_board_id = default_board.id;
        await this.SaveBoards();
        return this.boards;
      }
      this.boards = JSON.parse(boards_json);
      const saved_board_id = localStorage.getItem('kanban_current_board');
      if (saved_board_id && this.boards.find(b => b.id === saved_board_id)) {
        this.current_board_id = saved_board_id;
      } else if (this.boards.length > 0) {
        this.current_board_id = this.boards[0].id;
      }
      return this.boards;
    } catch (e) {
      console.error('Error loading boards:', e);
      return [];
    }
  }

  // Add column to board
  async AddColumnToBoard(board_id, column_name, column_color = 'gray') {
    const board = this.GetBoardById(board_id);
    if (!board) return null;
    const new_column = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name: column_name,
      color: column_color,
      order: board.columns.length
    };
    board.columns.push(new_column);
    await this.UpdateBoard(board_id, { columns: board.columns });
    return new_column;
  }

  // Update column in board
  async UpdateColumnInBoard(board_id, column_id, updates) {
    const board = this.GetBoardById(board_id);
    if (!board) return null;
    const column_index = board.columns.findIndex(c => c.id === column_id);
    if (column_index === -1) return null;
    board.columns[column_index] = {
      ...board.columns[column_index],
      ...updates
    };
    await this.UpdateBoard(board_id, { columns: board.columns });
    return board.columns[column_index];
  }

  // Delete column from board
  async DeleteColumnFromBoard(board_id, column_id) {
    const board = this.GetBoardById(board_id);
    if (!board) return false;
    board.columns = board.columns.filter(c => c.id !== column_id);
    board.columns.forEach((col, index) => {
      col.order = index;
    });
    await this.UpdateBoard(board_id, { columns: board.columns });
    return true;
  }

  // Reorder columns
  async ReorderColumns(board_id, column_orders) {
    const board = this.GetBoardById(board_id);
    if (!board) return false;
    column_orders.forEach(({ id, order }) => {
      const column = board.columns.find(c => c.id === id);
      if (column) {
        column.order = order;
      }
    });
    board.columns.sort((a, b) => a.order - b.order);
    await this.UpdateBoard(board_id, { columns: board.columns });
    return true;
  }
}
