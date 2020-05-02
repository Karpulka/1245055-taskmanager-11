import {render, RenderPosition, replace} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";

export default class TaskController {
  constructor(container, onDataChange) {
    this._container = container;
    this._onDataChange = onDataChange;
    this._taskComponent = null;
    this._taskEditComponent = null;
    this._onEditButtonClick = this._onEditButtonClick.bind(this);
    this._onEditFormSubmit = this._onEditFormSubmit.bind(this);
    this._onEscapeKeyPress = this._onEscapeKeyPress.bind(this);
    this._stopEdit = this._stopEdit.bind(this);
  }

  render(task) {
    const tasksContainerComponent = this._container;
    const tasksContainerElement = tasksContainerComponent.getElement();

    const oldTaskComponent = this._taskComponent;
    const oldTaskEditComponent = this._taskEditComponent;

    this._taskComponent = new Task(task);
    this._taskEditComponent = new TaskEdit(task);
    this._taskComponent.setEditButtonHandler(this._onEditButtonClick);
    this._taskComponent.setArchiveButtonClickHandler(() => {
      this._onDataChange(task, Object.assign({}, task, {
        isArchive: !task.isArchive,
      }));
    });
    this._taskComponent.setFavoritesButtonClickHandler(() => {
      this._onDataChange(task, Object.assign({}, task, {
        isFavorite: !task.isFavorite,
      }));
    });
    this._taskEditComponent.setSubmitHandler(this._onEditFormSubmit);
    if (oldTaskEditComponent && oldTaskComponent) {
      replace(this._taskComponent, oldTaskComponent);
      replace(this._taskEditComponent, oldTaskEditComponent);
    } else {
      render(tasksContainerElement, this._taskComponent, RenderPosition.BEFOREEND);
    }
  }

  _stopEdit() {
    replace(this._taskComponent, this._taskEditComponent);
    document.removeEventListener(`keydown`, this._onEscapeKeyPress);
  }

  _onEditButtonClick() {
    replace(this._taskEditComponent, this._taskComponent);
    document.addEventListener(`keydown`, this._onEscapeKeyPress);
  }

  _onEditFormSubmit(evt) {
    evt.preventDefault();
    this._stopEdit();
  }

  _onEscapeKeyPress(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      this._stopEdit();
    }
  }
}
