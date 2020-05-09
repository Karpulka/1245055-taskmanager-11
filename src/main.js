import Menu from "./components/menu";
import Board from "./components/board";
import {generateTasks} from "./mock/task";
import {render, RenderPosition} from "./utils/render";
import BoardController from "./controllers/board";
import Tasks from "./models/tasks";
import FilterController from "./controllers/filter";

const TASK_COUNT = 22;
const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);

const tasks = generateTasks(TASK_COUNT);

const tasksModel = new Tasks();
tasksModel.setTasks(tasks);
const filterController = new FilterController(mainControlContainer, tasksModel);
filterController.render();

render(mainControlContainer, new Menu(), RenderPosition.BEFOREEND);

const boardContainer = new Board();
render(mainContainer, boardContainer, RenderPosition.BEFOREEND);
new BoardController(boardContainer, tasksModel).render();
