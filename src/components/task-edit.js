import {COLORS, DAYS} from "../utils/constant";
import {getTaskTemplateData} from "../mock/task";
import AbstractSmartComponent from "./abstract-smart-component";
import flatpickr from "flatpickr";
import {formatTime, formatDate} from "../utils/common";
import {encode} from "he";

import "flatpickr/dist/flatpickr.min.css";

const MIN_DESCRIPTION_LENGTH = 1;
const MAX_DESCRIPTION_LENGTH = 140;

const isAllowableDescriptionLength = (description) => {
  const length = description.length;

  return length >= MIN_DESCRIPTION_LENGTH &&
    length <= MAX_DESCRIPTION_LENGTH;
};

const createColorsMarkup = (colors, currentColor) => {
  return colors
    .map((color, index) => {
      return (
        `<input
          type="radio"
          id="color-${color}--${index}"
          class="card__color-input card__color-input--${color} visually-hidden"
          name="color"
          value="${color}"
          ${currentColor === color ? `checked` : ``}
        />
        <label
          for="color-${color}--${index}"
          class="card__color card__color--${color}"
          >${color}</label
        >`
      );
    })
    .join(`\n`);
};

const createRepeatingDaysMarkup = (days, repeatingDays) => {
  return days
    .map((day, index) => {
      const isChecked = repeatingDays[day];
      return (
        `<input
          class="visually-hidden card__repeat-day-input"
          type="checkbox"
          id="repeat-${day}-${index}"
          name="repeat"
          value="${day}"
          ${isChecked ? `checked` : ``}
        />
        <label class="card__repeat-day" for="repeat-${day}-${index}"
          >${day}</label
        >`
      );
    })
    .join(`\n`);
};

const isRepeating = (repeatingDays) => {
  return Object.values(repeatingDays).some(Boolean);
};

const createTaskEditTemplate = (task, options = {}) => {
  const {color} = task;
  const {isDateShowing, isRepeatingTask, activeRepeatingDays, currentDescription} = options;
  const {date, repeatClass, deadlineClass} = getTaskTemplateData(task);
  const colorsMarkup = createColorsMarkup(COLORS, color);
  const repeatingDaysMarkup = createRepeatingDaysMarkup(DAYS, activeRepeatingDays);
  const isBlockSaveButton = (isDateShowing && isRepeatingTask) || (isRepeatingTask && !isRepeating(activeRepeatingDays)) || !isAllowableDescriptionLength(currentDescription);

  return `<article class="card card--edit card--${color}${repeatClass}${deadlineClass}">
            <form class="card__form" method="get">
              <div class="card__inner">
                <div class="card__color-bar">
                  <svg class="card__color-bar-wave" width="100%" height="10">
                    <use xlink:href="#wave"></use>
                  </svg>
                </div>

                <div class="card__textarea-wrap">
                  <label>
                    <textarea
                      class="card__text"
                      placeholder="Start typing your text here..."
                      name="text"
                    >${encode(currentDescription)}</textarea>
                  </label>
                </div>

                <div class="card__settings">
                  <div class="card__details">
                    <div class="card__dates">
                      <button class="card__date-deadline-toggle" type="button">
                        date: <span class="card__date-status">${isDateShowing ? `yes` : `no`}</span>
                      </button>
                      
                       ${isDateShowing ? `<fieldset class="card__date-deadline">
                                  <label class="card__input-deadline-wrap">
                                    <input
                                      class="card__date"
                                      type="text"
                                      placeholder=""
                                      name="date"
                                      value="${formatDate(date)} ${formatTime(date)}"
                                    />
                                  </label>
                                </fieldset>` : `` }

                      <button class="card__repeat-toggle" type="button">
                        repeat:<span class="card__repeat-status">${isRepeatingTask ? `yes` : `no`}</span>
                      </button>

                      ${isRepeatingTask ? `<fieldset class="card__repeat-days">
                                            <div class="card__repeat-days-inner">
                                              ${repeatingDaysMarkup}
                                            </div>
                                          </fieldset>` : ``}
                      
                    </div>
                  </div>

                  <div class="card__colors-inner">
                    <h3 class="card__colors-title">Color</h3>
                    <div class="card__colors-wrap">
                      ${colorsMarkup}
                    </div>
                  </div>
                </div>

                <div class="card__status-btns">
                  <button class="card__save" type="submit" ${isBlockSaveButton ? `disabled` : ``}>save</button>
                  <button class="card__delete" type="button">delete</button>
                </div>
              </div>
            </form>
          </article>`;
};

export default class TaskEdit extends AbstractSmartComponent {
  constructor(task) {
    super();
    this._task = task;
    this._defaultTask = Object.assign({}, task);
    this._isDateShowing = !!task.dueDate;
    this._currentDescription = task.description;
    this._isRepeatingTask = Object.values(task.repeatingDays).some(Boolean);
    this._activeRepeatingDays = Object.assign({}, task.repeatingDays);
    this._submitHandler = null;
    this._deleteHandler = null;
    this._subscribeOnEvents();
    this._flatpickr = null;

    this._applyFlatpickr();
  }

  removeElement() {
    if (this._flatpickr) {
      this._flatpickr.destroy();
      this._flatpickr = null;
    }

    super.removeElement();
  }

  getTemplate() {
    return createTaskEditTemplate(this._task, {
      isDateShowing: this._isDateShowing,
      isRepeatingTask: this._isRepeatingTask,
      activeRepeatingDays: this._activeRepeatingDays,
      currentDescription: this._currentDescription
    });
  }

  setSubmitHandler(handler) {
    this.getElement().querySelector(`form`).addEventListener(`submit`, handler);
    this._submitHandler = handler;
  }

  setButtonDeleteClickHandler(handler) {
    this.getElement().querySelector(`form .card__delete`).addEventListener(`click`, handler);
    this._deleteHandler = handler;
  }

  recoveryListeners() {
    this.setSubmitHandler(this._submitHandler);
    this.setButtonDeleteClickHandler(this._deleteHandler);
    this._subscribeOnEvents();
  }

  rerender() {
    super.rerender();

    this._applyFlatpickr();
  }

  getFormData() {
    const form = this.getElement().querySelector(`.card__form`);
    return new FormData(form);
  }

  reset() {
    const task = this._defaultTask;

    this._isDateShowing = !!task.dueDate;
    this._isRepeatingTask = Object.values(task.repeatingDays).some(Boolean);
    this._activeRepeatingDays = Object.assign({}, task.repeatingDays);
    this._currentDescription = task.description;
    this._task = Object.assign({}, task);

    this.rerender();
  }

  _subscribeOnEvents() {
    const element = this.getElement();

    element.querySelector(`.card__date-deadline-toggle`).addEventListener(`click`, () => {
      this._isDateShowing = !this._isDateShowing;
      this.rerender();
    });

    element.querySelector(`.card__repeat-toggle`).addEventListener(`click`, () => {
      this._isRepeatingTask = !this._isRepeatingTask;
      this.rerender();
    });

    element.querySelectorAll(`[name="color"]`).forEach((inputColor) => {
      inputColor.addEventListener(`change`, (evt) => {
        if (evt.target.value !== this._task.color) {
          this._task.color = evt.target.value;
          this.rerender();
        }
      });
    });

    const repeatDays = element.querySelector(`.card__repeat-days`);
    if (repeatDays) {
      repeatDays.addEventListener(`change`, (evt) => {
        this._activeRepeatingDays[evt.target.value] = evt.target.checked;
        const checkedDays = [];
        repeatDays.querySelectorAll(`[name="repeat"]:checked`).forEach((repeatDay) => {
          checkedDays.push(repeatDay.value);
        });
        DAYS.forEach((day) => {
          this._task.repeatingDays[day] = checkedDays.findIndex((dayName) => dayName === day) > -1 ? true : false;
        });
        this.rerender();
      });
    }

    element.querySelector(`textarea.card__text`).addEventListener(`change`, (evt) => {
      this._currentDescription = evt.target.value;
      this.rerender();
    });

    if (element.querySelector(`[name="date"]`)) {
      element.querySelector(`[name="date"]`).addEventListener(`change`, (evt) => {
        this._task.dueDate = new Date(evt.target.value);
        this.rerender();
      });
    }
  }

  _applyFlatpickr() {
    if (this._flatpickr) {
      this._flatpickr.destroy();
      this._flatpickr = null;
    }

    if (this._isDateShowing) {
      const dateElement = this.getElement().querySelector(`.card__date`);
      this._flatpickr = flatpickr(dateElement, {
        altInput: true,
        allowInput: true,
        defaultDate: this._task.dueDate || `today`,
        enableTime: true,
        altFormat: `d F H:i`,
        dateFormat: `Y-m-d H:i`
      });
    }
  }
}
