import Menu from "./components/menu";
import Filter from "./components/filter";
import Board from "./components/board";
import {generateTasks} from "./mock/task";
import {generateFilters} from "./mock/filter";
import {render, RenderPosition} from "./utils/render";
import BoardController from "./controllers/board";

const TASK_COUNT = 22;
const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);

const tasks = generateTasks(TASK_COUNT);
const filters = generateFilters();

render(mainControlContainer, new Menu(), RenderPosition.BEFOREEND);
render(mainControlContainer, new Filter(filters), RenderPosition.AFTEREND);

const boardContainer = new Board();
render(mainContainer, boardContainer, RenderPosition.BEFOREEND);
new BoardController(boardContainer).render(tasks);
