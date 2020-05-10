import {render, RenderPosition, replace, remove} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";

const Mode = {
  DEFAULT: `default`,
  EDIT: `edit`,
};

export default class TaskController {
  constructor(container, onDataChange, onViewChange) {
    this._container = container;
    this._onDataChange = onDataChange;
    this._onViewChange = onViewChange;
    this._mode = Mode.DEFAULT;
    this._taskComponent = null;
    this._taskEditComponent = null;
    this._onEditButtonClick = this._onEditButtonClick.bind(this);
    this._onEditFormSubmit = this._onEditFormSubmit.bind(this);
    this._onEscapeKeyPress = this._onEscapeKeyPress.bind(this);
    this._task = null;
  }

  get task() {
    return this._task;
  }

  render(task) {
    this._task = task;
    const tasksContainerComponent = this._container;
    const tasksContainerElement = tasksContainerComponent.getElement();

    const oldTaskComponent = this._taskComponent;
    const oldTaskEditComponent = this._taskEditComponent;

    this._taskComponent = new Task(task);
    this._taskEditComponent = new TaskEdit(task);

    if (oldTaskComponent !== this._taskComponent) {
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
  }

  _onEditButtonClick() {
    this._replaceTaskToEdit();
  }

  _onEditFormSubmit(evt) {
    evt.preventDefault();
    this._replaceEditToTask();
  }

  _onEscapeKeyPress(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      this._replaceEditToTask();
    }
  }

  _replaceEditToTask() {
    this._taskEditComponent.reset();
    replace(this._taskComponent, this._taskEditComponent);
    this._mode = Mode.DEFAULT;
    document.removeEventListener(`keydown`, this._onEscapeKeyPress);
  }

  _replaceTaskToEdit() {
    this._onViewChange();
    replace(this._taskEditComponent, this._taskComponent);
    this._mode = Mode.EDIT;
    document.addEventListener(`keydown`, this._onEscapeKeyPress);
  }

  setDefaultView() {
    if (this._mode !== Mode.DEFAULT) {
      this._replaceEditToTask();
    }
  }

  destroy() {
    remove(this._taskEditComponent);
    remove(this._taskComponent);
    document.removeEventListener(`keydown`, this._onEscapeKeyPress);
  }
}
