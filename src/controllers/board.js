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

const renderTasks = (taskListComponent, tasks) => {
  return tasks.map((task) => {
    const taskController = new TaskController(taskListComponent);
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
  }

  render(tasks) {
    this._tasks = tasks;
    const boardContainerElement = this._container.getElement();
    if (this._tasks.length > 0) {
      render(boardContainerElement, this._sortComponent, RenderPosition.AFTERBEGIN);
      renderTasks(this._taskListComponent, this._tasks.slice(0, this._showingTasksCount));
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
      renderTasks(this._taskListComponent, sortedTasks);

      if (this._showingTasksCount >= this._tasks.length) {
        remove(this._loadMoreButtonComponent);
      }
    });
  }

  _onSortTypeChange() {
    this._sortComponent.setSortTypeChangeHandler((sortType) => {
      this._showingTasksCount = TASK_COUNT_ON_PAGE;
      const sortedTasks = getSortedTasks(this._tasks, sortType, 0, this._showingTasksCount);
      this._taskListComponent.getElement().innerHTML = ``;

      renderTasks(this._taskListComponent, sortedTasks);
      remove(this._loadMoreButtonComponent);
      this._renderLoadMoreButton();
    });
  }
}
