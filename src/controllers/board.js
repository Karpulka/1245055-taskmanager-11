import {remove, render, RenderPosition} from "../utils/render";
import Sort from "../components/sort";
import TaskList from "../components/task-list";
import LoadMoreButton from "../components/load-more-button";
import NoTask from "../components/no-task";
import {SORT_TYPE} from "../utils/constant";
import TaskController from "./task";

const TASK_COUNT_ON_PAGE = 8;

const getSortedTasks = (tasks, sortType, from, to) => {
  let sortedTasks = [];
  const showingTasks = tasks.slice();

  switch (sortType) {
    case SORT_TYPE.DATE_UP:
      sortedTasks = showingTasks.sort((a, b) => a.dueDate - b.dueDate);
      break;
    case SORT_TYPE.DATE_DOWN:
      sortedTasks = showingTasks.sort((a, b) => b.dueDate - a.dueDate);
      break;
    case SORT_TYPE.DEFAULT:
      sortedTasks = showingTasks;
      break;
  }

  return sortedTasks.slice(from, to);
};

const renderTasks = (taskListComponent, tasks, onDataChange, onViewChange) => {
  return tasks.map((task) => {
    const taskController = new TaskController(taskListComponent, onDataChange, onViewChange);
    taskController.render(task);
    return taskController;
  });
};

export default class BoardController {
  constructor(container, tasksModel) {
    this._container = container;
    this._tasksModel = tasksModel;
    this._sortComponent = new Sort();
    this._taskListComponent = new TaskList();
    this._loadMoreButtonComponent = new LoadMoreButton();
    this._noTaskComponent = new NoTask();
    this._showingTasksCount = TASK_COUNT_ON_PAGE;
    this._showedTaskControllers = [];
    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._tasksModel.setFilterChangeHandler(this._onFilterChange);
  }

  render() {
    const tasks = this._tasksModel.getTasks();
    const boardContainerElement = this._container.getElement();
    if (tasks.length > 0) {
      render(boardContainerElement, this._sortComponent, RenderPosition.AFTERBEGIN);
      const newTasks = renderTasks(this._taskListComponent, tasks.slice(0, this._showingTasksCount), this._onDataChange, this._onViewChange);
      this._showedTaskControllers = this._showedTaskControllers.concat(newTasks);
      render(boardContainerElement, this._taskListComponent, RenderPosition.BEFOREEND);
      this._renderLoadMoreButton();
      this._onSortTypeChange();
    } else {
      render(boardContainerElement, this._noTaskComponent, RenderPosition.BEFOREEND);
    }
  }

  _renderLoadMoreButton() {
    remove(this._loadMoreButtonComponent);
    if (this._showingTasksCount >= this._tasksModel.getTasks().length) {
      return;
    }
    const boardContainerElement = this._container.getElement();
    render(boardContainerElement, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

    this._loadMoreButtonComponent.setClickHandler(() => {
      const prevTasksCount = this._showingTasksCount;
      this._showingTasksCount = this._showingTasksCount + TASK_COUNT_ON_PAGE;
      const sortedTasks = getSortedTasks(this._tasksModel.getTasks(), this._sortComponent.getSortType(), prevTasksCount, this._showingTasksCount);
      const newTasks = renderTasks(this._taskListComponent, sortedTasks, this._onDataChange, this._onViewChange);
      this._showedTaskControllers = this._showedTaskControllers.concat(newTasks);
      if (this._showingTasksCount >= this._tasksModel.getTasks().length) {
        remove(this._loadMoreButtonComponent);
      }
    });
  }

  _onSortTypeChange() {
    this._sortComponent.setSortTypeChangeHandler((sortType) => {
      this._showingTasksCount = TASK_COUNT_ON_PAGE;
      const sortedTasks = getSortedTasks(this._tasksModel.getTasks(), sortType, 0, this._showingTasksCount);
      this._taskListComponent.getElement().innerHTML = ``;
      const newTasks = renderTasks(this._taskListComponent, sortedTasks, this._onDataChange, this._onViewChange);
      this._showedTaskControllers = [].concat(newTasks);
      remove(this._loadMoreButtonComponent);
      this._renderLoadMoreButton();
    });
  }

  _onDataChange(oldData, newData) {
    if (newData === null) {
      this._tasksModel.deleteTask(oldData.id);
      this._updateTasks(this._showingTasksCount);
    } else if (oldData === null) {

    } else {
      const renderTaskControllers = this._showedTaskControllers.filter((taskController) => taskController.task.id === oldData.id);
      this._tasksModel.updateTask(oldData.id, newData);
      renderTaskControllers.forEach((taskController) => {
        taskController.render(newData);
      });
    }
  }

  _onViewChange() {
    this._showedTaskControllers.forEach((it) => it.setDefaultView());
  }

  _removeTasks() {
    this._showedTaskControllers.forEach((taskController) => taskController.destroy());
    this._showedTaskControllers = [];
  }

  _updateTasks(count) {
    this._removeTasks();
    this._renderTasks(this._tasksModel.getTasks().slice(0, count));
    this._renderLoadMoreButton();
  }

  _renderTasks(tasks) {
    const newTasks = renderTasks(this._taskListComponent, tasks, this._onDataChange, this._onViewChange);
    this._showedTaskControllers = this._showedTaskControllers.concat(newTasks);
    this._showingTasksCount = this._showedTaskControllers.length;
  }

  _onFilterChange() {
    this._updateTasks(TASK_COUNT_ON_PAGE);
  }
}
