export default class Tasks {
  constructor() {
    this._tasks = [];
  }

  setTasks(tasks) {
    this._tasks = tasks;
  }

  getTasks() {
    return this._tasks;
  }

  updateTask(id, newTask) {
    const index = this._tasks.findIndex((it) => it.id === id);
    if (index === -1) {
      return;
    }

    this._tasks = [].concat(this._tasks.slice(0, index), newTask, this._tasks.slice(index + 1));
  }
}
