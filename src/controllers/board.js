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
  constructor(container) {
    this._container = container;
    this._sortComponent = new Sort();
    this._taskListComponent = new TaskList();
    this._loadMoreButtonComponent = new LoadMoreButton();
    this._noTaskComponent = new NoTask();
    this._showingTasksCount = TASK_COUNT_ON_PAGE;
    this._tasks = [];
    this._showedTaskControllers = [];
    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._sortedTasks = [];
  }

  render(tasks) {
    this._tasks = tasks;
    const boardContainerElement = this._container.getElement();
    if (this._tasks.length > 0) {
      render(boardContainerElement, this._sortComponent, RenderPosition.AFTERBEGIN);
      this._sortedTasks = this._tasks.slice(0, this._showingTasksCount);
      const newTasks = renderTasks(this._taskListComponent, this._tasks.slice(0, this._showingTasksCount), this._onDataChange, this._onViewChange);
      this._showedTaskControllers = this._showedTaskControllers.concat(newTasks);
      render(boardContainerElement, this._taskListComponent, RenderPosition.BEFOREEND);
      this._renderLoadMoreButton();
      this._onSortTypeChange();
    } else {
      render(boardContainerElement, this._noTaskComponent, RenderPosition.BEFOREEND);
    }
  }

  _renderLoadMoreButton() {
    if (this._showingTasksCount >= this._tasks.length) {
      return;
    }
    const boardContainerElement = this._container.getElement();
    render(boardContainerElement, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

    this._loadMoreButtonComponent.setClickHandler(() => {
      const prevTasksCount = this._showingTasksCount;
      this._showingTasksCount = this._showingTasksCount + TASK_COUNT_ON_PAGE;
      const sortedTasks = getSortedTasks(this._tasks, this._sortComponent.getSortType(), prevTasksCount, this._showingTasksCount);
      this._sortedTasks = this._sortedTasks.concat(sortedTasks);
      const newTasks = renderTasks(this._taskListComponent, sortedTasks, this._onDataChange, this._onViewChange);
      this._showedTaskControllers = this._showedTaskControllers.concat(newTasks);
      if (this._showingTasksCount >= this._tasks.length) {
        remove(this._loadMoreButtonComponent);
      }
    });
  }

  _onSortTypeChange() {
    this._sortComponent.setSortTypeChangeHandler((sortType) => {
      this._showingTasksCount = TASK_COUNT_ON_PAGE;
      const sortedTasks = getSortedTasks(this._tasks, sortType, 0, this._showingTasksCount);
      this._sortedTasks = sortedTasks;
      this._taskListComponent.getElement().innerHTML = ``;
      const newTasks = renderTasks(this._taskListComponent, sortedTasks, this._onDataChange, this._onViewChange);
      this._showedTaskControllers = [].concat(newTasks);
      remove(this._loadMoreButtonComponent);
      this._renderLoadMoreButton();
    });
  }

  _onDataChange(oldData, newData) {
    const index = this._tasks.findIndex((it) => it === oldData);
    if (index === -1) {
      return;
    }

    this._tasks = [].concat(this._tasks.slice(0, index), newData, this._tasks.slice(index + 1));
    const renderTaskIndex = this._sortedTasks.findIndex((sortTask) => sortTask === oldData);
    this._sortedTasks[renderTaskIndex] = newData;
    this._showedTaskControllers[renderTaskIndex].render(newData);
  }

  _onViewChange() {
    this._showedTaskControllers.forEach((it) => it.setDefaultView());
  }
}
