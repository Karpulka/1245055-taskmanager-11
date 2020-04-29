import {remove, render, RenderPosition, replace} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";
import Sort from "../components/sort";
import TaskList from "../components/task-list";
import LoadMoreButton from "../components/load-more-button";
import NoTask from "../components/no-task";

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

export default class BoardController {
  constructor(container) {
    this._container = container;
    this._sortComponent = new Sort();
    this._taskListComponent = new TaskList();
    this._loadMoreButtonComponent = new LoadMoreButton();
    this._noTaskComponent = new NoTask();
  }

  render(tasks) {
    const boardContainerElement = this._container.getElement();
    if (tasks.length > 0) {
      render(boardContainerElement, this._sortComponent, RenderPosition.AFTERBEGIN);

      let showingTasksCount = TASK_COUNT_ON_PAGE;
      tasks.slice(0, showingTasksCount).forEach((task) => renderTask(this._taskListComponent, task));

      render(boardContainerElement, this._taskListComponent, RenderPosition.BEFOREEND);
      render(boardContainerElement, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

      this._loadMoreButtonComponent.setClickHandler(() => {
        const prevTasksCount = showingTasksCount;
        showingTasksCount = showingTasksCount + TASK_COUNT_ON_PAGE;

        tasks.slice(prevTasksCount, showingTasksCount)
          .forEach((task) => renderTask(this._taskListComponent, task));

        if (showingTasksCount >= tasks.length) {
          remove(this._loadMoreButtonComponent);
        }
      });
    } else {
      render(boardContainerElement, this._noTaskComponent, RenderPosition.BEFOREEND);
    }
  }
}
