import {FilterType} from "../utils/constant";
import {getTasksByFilter} from "../utils/filter";

export default class Tasks {
  constructor() {
    this._tasks = [];
    this._currentFilterType = FilterType.ALL;
    this._dataChangeHandlers = [];
    this._filterChangeHandlers = [];
  }

  setTasks(tasks) {
    console.log(tasks);
    this._tasks = tasks.slice();
    this._callHandlers(this._dataChangeHandlers);
  }

  getTasks() {
    return getTasksByFilter(this._tasks.slice(), this._currentFilterType);
  }

  getTasksAll() {
    return this._tasks;
  }

  updateTask(id, newTask) {
    const index = this._tasks.findIndex((it) => it.id === id);
    if (index === -1) {
      return;
    }

    this.setTasks([].concat(this._tasks.slice(0, index), newTask, this._tasks.slice(index + 1)));
  }

  deleteTask(id) {
    const index = this._tasks.findIndex((it) => it.id === id);
    if (index === -1) {
      return;
    }

    this.setTasks([].concat(this._tasks.slice(0, index), this._tasks.slice(index + 1)));
  }

  addTask(newData) {
    this.setTasks([].concat(newData, this._tasks));
  }

  setFilter(filterType) {
    this._currentFilterType = filterType;
    this._callHandlers(this._filterChangeHandlers);
  }

  setDataChangeHandler(handler) {
    this._dataChangeHandlers.push(handler);
  }

  setFilterChangeHandler(handler) {
    this._filterChangeHandlers.push(handler);
  }

  _callHandlers(handlers) {
    handlers.forEach((handler) => handler());
  }
}
