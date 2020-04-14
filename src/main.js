import {createMenuTemplate} from "./components/menu";
import {createFilterTemplate} from "./components/filter";
import {createSortTemplate} from "./components/sort";
import {createTaskEditTemplate} from "./components/task-edit";
import {createTaskCardTemplate} from "./components/task-card";
import {createLoadMoreTemplate} from "./components/load-more-button";
import {generateTasks} from "./mock/task";
import {generateFilters} from "./mock/filter";

const TASK_COUNT = 25;
const TASK_COUNT_ON_PAGE = 8;

const tasks = generateTasks(TASK_COUNT);
const filters = generateFilters();

const mainControlContainer = document.querySelector(`.main__control`);

const render = (container, template, position) => {
  container.insertAdjacentHTML(position, template);
};

const boardContainerElement = document.createElement(`section`);
boardContainerElement.classList.add(`board`, `container`);

const tasksContainerElement = document.createElement(`div`);
tasksContainerElement.classList.add(`board__tasks`);

render(mainControlContainer, createMenuTemplate(), `beforeend`);
render(mainControlContainer, createFilterTemplate(filters), `afterend`);
render(boardContainerElement, createSortTemplate(), `afterbegin`);

render(tasksContainerElement, createTaskEditTemplate(tasks[0]), `beforeend`);
let showingTasksCount = TASK_COUNT_ON_PAGE;
tasks.slice(1, showingTasksCount).forEach((task) => {
  render(tasksContainerElement, createTaskCardTemplate(task), `beforeend`);
});

boardContainerElement.appendChild(tasksContainerElement);
render(boardContainerElement, createLoadMoreTemplate(), `beforeend`);
document.querySelector(`.main`).appendChild(boardContainerElement);

const loadMoreButton = boardContainerElement.querySelector(`.load-more`);

loadMoreButton.addEventListener(`click`, () => {
  const prevTasksCount = showingTasksCount;
  showingTasksCount = showingTasksCount + TASK_COUNT_ON_PAGE;

  tasks.slice(prevTasksCount, showingTasksCount)
    .forEach((task) => render(tasksContainerElement, createTaskCardTemplate(task), `beforeend`));

  if (showingTasksCount >= tasks.length) {
    loadMoreButton.remove();
  }
});
