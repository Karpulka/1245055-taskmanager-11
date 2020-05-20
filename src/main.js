import API from "./api/api";
import Provider from "./api/provider";
import Store from "./api/store";
import Board from "./components/board";
import BoardController from "./controllers/board";
import FilterController from "./controllers/filter";
import Load from "./components/load";
import Menu, {MenuItem} from "./components/menu";
import Statistic from "./components/statistic";
import Tasks from "./models/tasks";
import {render, remove, RenderPosition} from "./utils/render";

const AUTHORIZATION = `Basic 15GHFxc57vbnhh76fgFvbngsdfgvFHDv2=`;
const END_POINT = `https://11.ecmascript.pages.academy/task-manager`;
const STORE_PREFIX = `taskmanager-localstorage`;
const STORE_VER = `v1`;
const STORE_NAME = `${STORE_PREFIX}-${STORE_VER}`;

const dateTo = new Date();
const dateFrom = (() => {
  const d = new Date(dateTo);
  d.setDate(d.getDate() - 7);
  return d;
})();

const api = new API(END_POINT, AUTHORIZATION);
const store = new Store(STORE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, store);
const tasksModel = new Tasks();

const mainContainer = document.querySelector(`.main`);
const mainControlContainer = document.querySelector(`.main__control`);
const menuComponent = new Menu();
const loadComponent = new Load();
const statistic = new Statistic({tasks: tasksModel, dateFrom, dateTo});
const boardContainer = new Board();
const boardController = new BoardController(boardContainer, tasksModel, apiWithProvider);
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
render(boardContainer.getElement(), loadComponent, RenderPosition.BEFOREEND);

apiWithProvider.getTasks()
  .then((tasks) => {
    remove(loadComponent);
    tasksModel.setTasks(tasks);
    boardController.render();
  })
  .catch(() => {
    tasksModel.setTasks([]);
    boardController.render();
  });

window.addEventListener(`load`, () => {
  navigator.serviceWorker.register(`/sw.js`)
    .then(() => {
      // Действие, в случае успешной регистрации ServiceWorker
    }).catch(() => {
    // Действие, в случае ошибки при регистрации ServiceWorker
  });
});

window.addEventListener(`online`, () => {
  document.title = document.title.replace(` [offline]`, ``);

  apiWithProvider.sync();
});

window.addEventListener(`offline`, () => {
  document.title += ` [offline]`;
});
