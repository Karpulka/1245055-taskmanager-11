import Menu, {MenuItem} from "./components/menu";
import Board from "./components/board";
import {generateTasks} from "./mock/task";
import {render, RenderPosition} from "./utils/render";
import BoardController from "./controllers/board";
import Tasks from "./models/tasks";
import FilterController from "./controllers/filter";
import Statistic from "./components/statistic";

const TASK_COUNT = 22;
const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);

const tasks = generateTasks(TASK_COUNT);

const tasksModel = new Tasks();
tasksModel.setTasks(tasks);
const filterController = new FilterController(mainControlContainer, tasksModel);
filterController.render();

const dateTo = new Date();
const dateFrom = (() => {
  const d = new Date(dateTo);
  d.setDate(d.getDate() - 7);
  return d;
})();
const statistic = new Statistic({tasks: tasksModel, dateFrom, dateTo});
statistic.hide();

const menuComponent = new Menu();
render(mainControlContainer, menuComponent, RenderPosition.BEFOREEND);

const boardContainer = new Board();
render(mainContainer, boardContainer, RenderPosition.BEFOREEND);
const boardController = new BoardController(boardContainer, tasksModel);
boardController.render();

menuComponent.setOnChange((menuItem) => {
  switch (menuItem) {
    case MenuItem.NEW_TASK:
      menuComponent.setActiveItem(MenuItem.TASKS);
      statistic.hide();
      boardController.show();
      boardController.createTask();
      break;
    case MenuItem.STATISTICS:
      boardController.hide();
      statistic.show();
      break;
    default:
      statistic.hide();
      boardController.show();
      break;
  }
});

render(mainContainer, statistic, RenderPosition.BEFOREEND);
