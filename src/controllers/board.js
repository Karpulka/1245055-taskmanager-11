import {remove, render, RenderPosition} from "../utils/render";
import Sort from "../components/sort";
import TaskList from "../components/task-list";
import LoadMoreButton from "../components/load-more-button";
import NoTask from "../components/no-task";
import {SORT_TYPE} from "../utils/constant";
import TaskController, {Mode as TaskControllerMode, EmptyTask} from "./task";
import {getRandomNumber} from "../utils/common";

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
  constructor(container, tasksModel, api) {
    this._container = container;
    this._tasksModel = tasksModel;
    this._sortComponent = new Sort();
    this._taskListComponent = new TaskList();
    this._loadMoreButtonComponent = new LoadMoreButton();
    this._noTaskComponent = new NoTask();
    this._showingTasksCount = TASK_COUNT_ON_PAGE;
    this._showedTaskControllers = [];
    this._creatingTask = null;
    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._tasksModel.setFilterChangeHandler(this._onFilterChange);
    this._api = api;
  }

  render() {
    const tasks = this._tasksModel.getTasks();
    const boardContainerElement = this._container.getElement();
    const isAllTasksArchived = tasks.every((task) => task.isArchive);
    if (tasks.length > 0 && !isAllTasksArchived) {
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

  createTask() {
    if (this._creatingTask) {
      return;
    }

    const emptyTask = Object.assign({}, EmptyTask);
    emptyTask.id = new Date().getTime() + getRandomNumber(1, 10000);

    this._creatingTask = new TaskController(this._taskListComponent, this._onDataChange, this._onViewChange);
    this._creatingTask.render(emptyTask, TaskControllerMode.ADDING);
    this._showedTaskControllers = [].concat(this._creatingTask, this._showedTaskControllers);
    this._showingTasksCount = this._showedTaskControllers.length;
  }

  show() {
    const containerElement = this._container.getElement();
    if (containerElement.classList.contains(`visually-hidden`)) {
      this._changeSort(SORT_TYPE.DEFAULT);
      containerElement.classList.remove(`visually-hidden`);
    }
  }

  hide() {
    const containerElement = this._container.getElement();
    if (!containerElement.classList.contains(`visually-hidden`)) {
      containerElement.classList.add(`visually-hidden`);
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
      this._changeSort(sortType);
    });
  }

  _changeSort(sortType) {
    this._showingTasksCount = TASK_COUNT_ON_PAGE;
    const sortedTasks = getSortedTasks(this._tasksModel.getTasks(), sortType, 0, this._showingTasksCount);
    this._taskListComponent.getElement().innerHTML = ``;
    const newTasks = renderTasks(this._taskListComponent, sortedTasks, this._onDataChange, this._onViewChange);
    this._showedTaskControllers = [].concat(newTasks);
    remove(this._loadMoreButtonComponent);
    this._renderLoadMoreButton();
  }

  _onDataChange(oldData, newData) {
    if (oldData === EmptyTask) {
      if (newData === null) {
        this._showedTaskControllers[0].destroy();
        this._showedTaskControllers.shift();
        this._showingTasksCount = this._showedTaskControllers.length;
        this._updateTasks(this._showingTasksCount);
      } else {
        this._api.createTask(newData)
          .then((taskModel) => {
            this._tasksModel.addTask(taskModel);
            this._showedTaskControllers[0].render(taskModel, TaskControllerMode.DEFAULT);

            if (this._showingTasksCount % TASK_COUNT_ON_PAGE === 0) {
              const destroyedTask = this._showedTaskControllers.pop();
              destroyedTask.destroy();
            }

            this._renderLoadMoreButton();
          });
      }
    } else if (newData === null) {
      this._api.deleteTask(oldData.id)
        .then(() => {
          this._tasksModel.deleteTask(oldData.id);
          this._updateTasks(this._showingTasksCount);
        });
    } else {
      this._api.updateTask(oldData.id, newData)
        .then((task) => {
          const renderTaskControllers = this._showedTaskControllers.filter((taskController) => taskController.task.id === task.id);
          this._tasksModel.updateTask(task.id, task);
          renderTaskControllers.forEach((taskController) => {
            taskController.render(task);
          });
        });
    }
    this._creatingTask = null;
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
