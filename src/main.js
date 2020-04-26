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
import {render, RenderPosition} from "./util";

const TASK_COUNT = 25;
const TASK_COUNT_ON_PAGE = 8;

const renderTask = (tasksContainerElement, task) => {
  const onEditButtonClick = () => {
    tasksContainerElement.replaceChild(taskEditElement, taskElement);
  };

  const onEditFormSubmit = (evt) => {
    evt.preventDefault();
    tasksContainerElement.replaceChild(taskElement, taskEditElement);
  };

  const taskElement = new Task(task).getElement();
  const editButton = taskElement.querySelector(`.card__btn--edit`);
  editButton.addEventListener(`click`, onEditButtonClick);

  const taskEditElement = new TaskEdit(task).getElement();
  const editForm = taskEditElement.querySelector(`form`);
  editForm.addEventListener(`submit`, onEditFormSubmit);

  render(tasksContainerElement, taskElement, RenderPosition.BEFOREEND);
};

const renderBoard = (boardContainerElement, tasks) => {
  const tasksContainerElement = new TaskList().getElement();

  let showingTasksCount = TASK_COUNT_ON_PAGE;
  tasks.slice(0, showingTasksCount).forEach((task) => renderTask(tasksContainerElement, task));

  const loadMoreButton = new LoadMoreButton().getElement();

  render(boardContainerElement, tasksContainerElement, RenderPosition.BEFOREEND)
  render(boardContainerElement, loadMoreButton, RenderPosition.BEFOREEND);

  loadMoreButton.addEventListener(`click`, () => {
    const prevTasksCount = showingTasksCount;
    showingTasksCount = showingTasksCount + TASK_COUNT_ON_PAGE;

    tasks.slice(prevTasksCount, showingTasksCount)
      .forEach((task) => renderTask(tasksContainerElement, task));

    if (showingTasksCount >= tasks.length) {
      loadMoreButton.remove();
    }
  });
}

const tasks = generateTasks(TASK_COUNT);
const filters = generateFilters();
const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);

render(mainControlContainer, new Menu().getElement(), RenderPosition.BEFOREEND);
render(mainControlContainer, new Filter(filters).getElement(), RenderPosition.AFTEREND);

const boardContainerElement = new Board().getElement();
render(boardContainerElement, new Sort().getElement(), RenderPosition.AFTERBEGIN);
render(mainContainer, boardContainerElement, RenderPosition.BEFOREEND);
renderBoard(boardContainerElement, tasks);
