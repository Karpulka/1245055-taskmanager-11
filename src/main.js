import Menu from "./components/menu";
import Filter from "./components/filter";
import Sort from "./components/sort";
import TaskEdit from "./components/task-edit";
import Task from "./components/task-card";
import LoadMoreButton from "./components/load-more-button";
import Board from "./components/board";
import TaskList from "./components/task-list";
import {generateTasks} from "./mock/task";
import {generateFilters} from "./mock/filter";
import {render, RenderPosition, createElement} from "./util";

const TASK_COUNT = 22;
const TASK_COUNT_ON_PAGE = 8;
const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);

const getNoTasksText = () => {
  return `<p class="board__no-tasks">
            Click «ADD NEW TASK» in menu to create your first task
          </p>`;
};

const renderTask = (tasksContainerElement, task) => {
  const stopEdit = () => {
    tasksContainerElement.replaceChild(taskElement, taskEditElement);
  };

  const onEditButtonClick = () => {
    tasksContainerElement.replaceChild(taskEditElement, taskElement);
  };

  const onEditFormSubmit = (evt) => {
    evt.preventDefault();
    stopEdit();
  };

  const onEscapeKeyPress = (evt) => {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      stopEdit();
      document.removeEventListener(`keydown`, onEscapeKeyPress);
    }
  };

  const taskElement = new Task(task).getElement();
  const editButton = taskElement.querySelector(`.card__btn--edit`);
  editButton.addEventListener(`click`, onEditButtonClick);

  const taskEditElement = new TaskEdit(task).getElement();
  const editForm = taskEditElement.querySelector(`form`);
  editForm.addEventListener(`submit`, onEditFormSubmit);
  document.addEventListener(`keydown`, onEscapeKeyPress);

  render(tasksContainerElement, taskElement, RenderPosition.BEFOREEND);
};

const renderBoard = (boardContainerElement, tasks) => {
  if (tasks.length > 0) {
    render(boardContainerElement, new Sort().getElement(), RenderPosition.AFTERBEGIN);
    const tasksContainerElement = new TaskList().getElement();

    let showingTasksCount = TASK_COUNT_ON_PAGE;
    tasks.slice(0, showingTasksCount).forEach((task) => renderTask(tasksContainerElement, task));

    const loadMoreButton = new LoadMoreButton();
    const loadMoreButtonElement = loadMoreButton.getElement();

    render(boardContainerElement, tasksContainerElement, RenderPosition.BEFOREEND)
    render(boardContainerElement, loadMoreButtonElement, RenderPosition.BEFOREEND);

    loadMoreButtonElement.addEventListener(`click`, () => {
      const prevTasksCount = showingTasksCount;
      showingTasksCount = showingTasksCount + TASK_COUNT_ON_PAGE;

      tasks.slice(prevTasksCount, showingTasksCount)
        .forEach((task) => renderTask(tasksContainerElement, task));

      if (showingTasksCount >= tasks.length) {
        loadMoreButtonElement.remove();
        loadMoreButton.removeElement();
      }
    });
  } else {
    render(boardContainerElement, createElement(getNoTasksText()), RenderPosition.BEFOREEND);
  }
}

const tasks = generateTasks(TASK_COUNT);
const filters = generateFilters();

render(mainControlContainer, new Menu().getElement(), RenderPosition.BEFOREEND);
render(mainControlContainer, new Filter(filters).getElement(), RenderPosition.AFTEREND);

const boardContainerElement = new Board().getElement();
render(mainContainer, boardContainerElement, RenderPosition.BEFOREEND);
renderBoard(boardContainerElement, tasks);
