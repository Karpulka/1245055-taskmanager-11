import API from "./api";
import Board from "./components/board";
import BoardController from "./controllers/board";
import FilterController from "./controllers/filter";
import Menu, {MenuItem} from "./components/menu";
import Statistic from "./components/statistic";
import Tasks from "./models/tasks";
import {render, RenderPosition} from "./utils/render";

const AUTHORIZATION = `Basic 15GHFxc57vbnhh1fhFvbn5gvFHDv2=`;
const END_POINT = `https://11.ecmascript.pages.academy/task-manager`;

const dateTo = new Date();
const dateFrom = (() => {
  const d = new Date(dateTo);
  d.setDate(d.getDate() - 7);
  return d;
})();

const api = new API(END_POINT, AUTHORIZATION);
const tasksModel = new Tasks();

const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);
const menuComponent = new Menu();
const statistic = new Statistic({tasks: tasksModel, dateFrom, dateTo});
const boardContainer = new Board();
const boardController = new BoardController(boardContainer, tasksModel);
const filterController = new FilterController(mainControlContainer, tasksModel);

render(mainControlContainer, menuComponent, RenderPosition.BEFOREEND);
filterController.render();
statistic.hide();
render(mainContainer, boardContainer, RenderPosition.BEFOREEND);

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

api.getTasks()
  .then((tasks) => {
    tasksModel.setTasks(tasks);
    boardController.render();
  });
