class DragDropManager {
  constructor(task_manager, ui_manager, board_manager = null) {
    this.task_manager = task_manager;
    this.ui_manager = ui_manager;
    this.board_manager = board_manager;
    this.dragging_task_id = null;
    this.dragging_task_element = null;
    this.drop_target_task_id = null;
    this.drop_position = null;
  }

  // Handle drag start event
  HandleDragStart(event, task_id) {
    this.dragging_task_id = task_id;
    this.dragging_task_element = event.target;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.innerHTML);
  }

  // Handle drag end event
  HandleDragEnd(event) {
    event.target.classList.remove('dragging');
    document.querySelectorAll('.swim-lane').forEach(lane => {
      lane.classList.remove('drag-over');
    });
    document.querySelectorAll('.task').forEach(task => {
      task.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    this.dragging_task_id = null;
    this.dragging_task_element = null;
    this.drop_target_task_id = null;
    this.drop_position = null;
  }

  // Handle task drag over event
  HandleTaskDragOver(event, task_id) {
    event.preventDefault();
    event.stopPropagation();
    if (task_id === this.dragging_task_id) return;
    const task_element = event.currentTarget;
    const rect = task_element.getBoundingClientRect();
    const mouse_y = event.clientY;
    const task_middle = rect.top + rect.height / 2;
    document.querySelectorAll('.task').forEach(task => {
      task.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    if (mouse_y < task_middle) {
      task_element.classList.add('drag-over-top');
      this.drop_position = 'before';
    } else {
      task_element.classList.add('drag-over-bottom');
      this.drop_position = 'after';
    }
    this.drop_target_task_id = task_id;
  }

  // Handle task drop event
  async HandleTaskDrop(event, task_id) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.dragging_task_id || this.dragging_task_id === task_id) return;
    const dragging_task = this.task_manager.GetTaskById(this.dragging_task_id);
    const target_task = this.task_manager.GetTaskById(task_id);
    if (!dragging_task || !target_task) return;
    const board_id = this.board_manager?.GetCurrentBoard()?.id;
    if (dragging_task.status === target_task.status) {
      const position = this.drop_position || 'after';
      await this.task_manager.ReorderTasksInColumn(
        this.dragging_task_id,
        task_id,
        position,
        board_id
      );
    } else {
      await this.task_manager.UpdateTask(
        this.dragging_task_id,
        { status: target_task.status },
        board_id
      );
    }
    document.querySelectorAll('.task').forEach(task => {
      task.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    this.ui_manager.RenderTasks();
  }

  // Handle drag over event
  HandleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
  }

  // Handle drag leave event
  HandleDragLeave(event) {
    if (
      event.currentTarget === event.target ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      event.currentTarget.classList.remove('drag-over');
    }
  }

  // Handle drop event
  async HandleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const new_status = event.currentTarget.dataset.status;
    if (this.dragging_task_id && new_status) {
      const board_id = this.board_manager?.GetCurrentBoard()?.id;
      await this.task_manager.UpdateTask(
        this.dragging_task_id,
        { status: new_status },
        board_id
      );
      this.ui_manager.RenderTasks();
    }
  }
}
