import Menu from "./components/menu";
import Filter from "./components/filter";
import Sort from "./components/sort";
import TaskEdit from "./components/task-edit";
import Task from "./components/task-card";
import LoadMoreButton from "./components/load-more-button";
import Board from "./components/board";
import TaskList from "./components/task-list";
import NoTask from "./components/no-task";
import {generateTasks} from "./mock/task";
import {generateFilters} from "./mock/filter";
import {render, RenderPosition, remove, replace} from "./utils/render";

const TASK_COUNT = 22;
const TASK_COUNT_ON_PAGE = 8;
const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);

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

const renderBoard = (boardContainerComponent, tasks) => {
  const boardContainerElement = boardContainerComponent.getElement();
  if (tasks.length > 0) {
    render(boardContainerElement, new Sort(), RenderPosition.AFTERBEGIN);
    const tasksContainer = new TaskList();

    let showingTasksCount = TASK_COUNT_ON_PAGE;
    tasks.slice(0, showingTasksCount).forEach((task) => renderTask(tasksContainer, task));

    const loadMoreButton = new LoadMoreButton();

    render(boardContainerElement, tasksContainer, RenderPosition.BEFOREEND)
    render(boardContainerElement, loadMoreButton, RenderPosition.BEFOREEND);

    loadMoreButton.setClickHandler(() => {
      const prevTasksCount = showingTasksCount;
      showingTasksCount = showingTasksCount + TASK_COUNT_ON_PAGE;

      tasks.slice(prevTasksCount, showingTasksCount)
        .forEach((task) => renderTask(tasksContainer, task));

      if (showingTasksCount >= tasks.length) {
        remove(loadMoreButton);
      }
    });
  } else {
    render(boardContainerElement, new NoTask(), RenderPosition.BEFOREEND);
  }
}

const tasks = generateTasks(TASK_COUNT);
const filters = generateFilters();

render(mainControlContainer, new Menu(), RenderPosition.BEFOREEND);
render(mainControlContainer, new Filter(filters), RenderPosition.AFTEREND);

const boardContainer = new Board();
render(mainContainer, boardContainer, RenderPosition.BEFOREEND);
renderBoard(boardContainer, tasks);
