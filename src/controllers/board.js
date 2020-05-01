import {remove, render, RenderPosition, replace} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";
import Sort from "../components/sort";
import TaskList from "../components/task-list";
import LoadMoreButton from "../components/load-more-button";
import NoTask from "../components/no-task";
import {SORT_TYPE} from "../utils/constant";

const TASK_COUNT_ON_PAGE = 8;

const renderTask = (tasksContainerComponent, task) => {
  const tasksContainerElement = tasksContainerComponent.getElement();

  const stopEdit = () => {
    replace(taskComponent, taskEditComponent);
    document.removeEventListener(`keydown`, onEscapeKeyPress);
  };

  const onEditButtonClick = () => {
    replace(taskEditComponent, taskComponent);
    document.addEventListener(`keydown`, onEscapeKeyPress);
  };

  const onEditFormSubmit = (evt) => {
    evt.preventDefault();
    stopEdit();
  };

  const onEscapeKeyPress = (evt) => {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      stopEdit();
    }
  };

  const taskComponent = new Task(task);
  taskComponent.setEditButtonHandler(onEditButtonClick);

  const taskEditComponent = new TaskEdit(task);
  taskEditComponent.setSubmitHandler(onEditFormSubmit);

  render(tasksContainerElement, taskComponent, RenderPosition.BEFOREEND);
};

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
  tasks.forEach((task) => renderTask(taskListComponent, task));
};

export default class BoardController {
  constructor(container) {
    this._container = container;
    this._sortComponent = new Sort();
    this._taskListComponent = new TaskList();
    this._loadMoreButtonComponent = new LoadMoreButton();
    this._noTaskComponent = new NoTask();
  }

  render(tasks) {
    const renderLoadMoreButton = (showingTasksCount) => {
      if (showingTasksCount >= tasks.length) {
        return;
      }

      render(boardContainerElement, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

      this._loadMoreButtonComponent.setClickHandler(() => {
        const prevTasksCount = showingTasksCount;
        showingTasksCount = showingTasksCount + TASK_COUNT_ON_PAGE;
        const sortedTasks = getSortedTasks(tasks, this._sortComponent.getSortType(), prevTasksCount, showingTasksCount);
        renderTasks(this._taskListComponent, sortedTasks);

        if (showingTasksCount >= tasks.length) {
          remove(this._loadMoreButtonComponent);
        }
      });
    };

    const boardContainerElement = this._container.getElement();
    if (tasks.length > 0) {
      render(boardContainerElement, this._sortComponent, RenderPosition.AFTERBEGIN);
      let showingTasksCount = TASK_COUNT_ON_PAGE;
      renderTasks(this._taskListComponent, tasks.slice(0, showingTasksCount));
      render(boardContainerElement, this._taskListComponent, RenderPosition.BEFOREEND);
      renderLoadMoreButton(showingTasksCount);

      this._sortComponent.setSortTypeChangeHandler((sortType) => {
        showingTasksCount = TASK_COUNT_ON_PAGE;
        const sortedTasks = getSortedTasks(tasks, sortType, 0, showingTasksCount);
        this._taskListComponent.getElement().innerHTML = ``;

        renderTasks(this._taskListComponent, sortedTasks);
        remove(this._loadMoreButtonComponent);
        renderLoadMoreButton(showingTasksCount);
      });
    } else {
      render(boardContainerElement, this._noTaskComponent, RenderPosition.BEFOREEND);
    }
  }
}
