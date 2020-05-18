import {render, RenderPosition, replace, remove} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";
import TaskModel from "../models/task";
import {DEFAULT_COLOR, DAYS} from "../utils/constant";

const SHAKE_ANIMATION_TIMEOUT = 600;

const parseFormData = (formData) => {
  const date = formData.get(`date`);
  const repeatingDays = DAYS.reduce((acc, day) => {
    acc[day] = false;
    return acc;
  }, {});

  return new TaskModel({
    "description": formData.get(`text`),
    "due_date": date ? new Date(date) : null,
    "repeating_days": formData.getAll(`repeat`).reduce((acc, it) => {
      acc[it] = true;
      return acc;
    }, repeatingDays),
    "color": formData.get(`color`),
    "is_favorite": false,
    "is_done": false,
  });
};

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
        const newTask = TaskModel.clone(task);
        newTask.isArchive = !newTask.isArchive;
        this._onDataChange(task, newTask);
      });
      this._taskComponent.setFavoritesButtonClickHandler(() => {
        const newTask = TaskModel.clone(task);
        newTask.isFavorite = !newTask.isFavorite;
        this._onDataChange(task, newTask);
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

    const formData = this._taskEditComponent.getFormData();
    const data = parseFormData(formData);

    if (this._mode === Mode.ADDING) {
      this._mode = Mode.DEFAULT;
      this._onDataChange(EmptyTask, data);
    } else {
      this._mode = Mode.DEFAULT;
      this._onDataChange(this._task, data);
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

  shake() {
    this._taskEditComponent.getElement().style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;
    this._taskComponent.getElement().style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(() => {
      this._taskEditComponent.getElement().style.animation = ``;
      this._taskComponent.getElement().style.animation = ``;
    }, SHAKE_ANIMATION_TIMEOUT);
  }
}
