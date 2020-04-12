import {createMenuTemplate} from "./components/menu";
import {createFilterTemplate} from "./components/filter";
import {createSortTemplate} from "./components/sort";
import {createTaskEditTemplate} from "./components/task-edit";
import {createTaskCardTemplate} from "./components/task-card";
import {createLoadMoreTemplate} from "./components/load-more-button";
import {generateTasks} from "./mock/task";

const TASK_COUNT = 20;
const TASK_COUNT_ON_PAGE = 8;

const mainControlContainer = document.querySelector(`.main__control`);

const render = (container, template, position) => {
  container.insertAdjacentHTML(position, template);
};

const boardContainerElement = document.createElement(`section`);
boardContainerElement.classList.add(`board`, `container`);

const tasksContainerElement = document.createElement(`div`);
tasksContainerElement.classList.add(`board__tasks`);

render(mainControlContainer, createMenuTemplate(), `beforeend`);
render(mainControlContainer, createFilterTemplate(), `afterend`);
render(boardContainerElement, createSortTemplate(), `afterbegin`);

const tasks = generateTasks(TASK_COUNT);
render(tasksContainerElement, createTaskEditTemplate(tasks[0]), `beforeend`);
tasks.slice(1, TASK_COUNT_ON_PAGE).forEach((task) => {
  render(tasksContainerElement, createTaskCardTemplate(task), `beforeend`);
});

boardContainerElement.appendChild(tasksContainerElement);
render(boardContainerElement, createLoadMoreTemplate(), `beforeend`);
document.querySelector(`.main`).appendChild(boardContainerElement);
