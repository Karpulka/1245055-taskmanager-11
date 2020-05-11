import {render, RenderPosition, replace, remove} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";
import {DEFAULT_COLOR} from "../utils/constant";

export const Mode = {
  ADDING: `adding`,
  DEFAULT: `default`,
  EDIT: `edit`,
};

export const EmptyTask = {
  description: ``,
  dueDate: null,
  repeatingDays: {
    "mo": false,
    "tu": false,
    "we": false,
    "th": false,
    "fr": false,
    "sa": false,
    "su": false,
  },
  color: DEFAULT_COLOR,
  isFavorite: false,
  isArchive: false,
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

  render(task, mode) {
    this._task = Object.assign({}, task);
    this._mode = mode ? mode : this._mode;
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
      this._taskEditComponent.setButtonDeleteClickHandler(() => {
        if (this._mode === Mode.ADDING) {
          this._onDataChange(EmptyTask, null);
        } else {
          this._onDataChange(task, null);
        }
        this.destroy();
      });

      switch (this._mode) {
        case Mode.DEFAULT:
          if (oldTaskEditComponent && oldTaskComponent) {
            replace(this._taskComponent, oldTaskComponent);
            replace(this._taskEditComponent, oldTaskEditComponent);
          } else {
            render(tasksContainerElement, this._taskComponent, RenderPosition.BEFOREEND);
          }
          break;
        case Mode.ADDING:
          if (oldTaskEditComponent && oldTaskComponent) {
            remove(oldTaskComponent);
            remove(oldTaskEditComponent);
          }
          document.addEventListener(`keydown`, this._onEscapeKeyPress);
          render(tasksContainerElement, this._taskEditComponent, RenderPosition.AFTERBEGIN);
          break;
      }
    }
  }

  _onEditButtonClick() {
    this._replaceTaskToEdit();
  }

  _onEditFormSubmit(evt) {
    evt.preventDefault();
    if (this._mode === Mode.ADDING) {
      this._mode = Mode.DEFAULT;
      this._onDataChange(EmptyTask, this._taskEditComponent.getFormData());
    } else {
      this._mode = Mode.DEFAULT;
      this._onDataChange(this._task, this._taskEditComponent.getFormData());
    }
    replace(this._taskComponent, this._taskEditComponent);
  }

  _onEscapeKeyPress(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      if (this._mode === Mode.ADDING) {
        this._onDataChange(EmptyTask, null);
      }

      this._replaceEditToTask();
    }
  }

  _replaceEditToTask() {
    this._taskEditComponent.reset();

    if (document.contains(this._taskEditComponent.getElement())) {
      replace(this._taskComponent, this._taskEditComponent);
    }

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
