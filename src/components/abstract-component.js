import {createElement} from "../utils/render";

export default class AbstractComponent {
  constructor() {
    if (new.target === AbstractComponent) {
      throw new Error(`Can't instantiate AbstractComponent, only concrete one.`);
    }

    this._element = null;
  }

  getTemplate() {
    throw new Error(`Abstract method not implemented: getTemplate`);
  }

  getElement() {
    if (!this._element) {
      this._element = createElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }

  show() {
    const element = this.getElement();
    if (element.classList.contains(`visually-hidden`)) {
      element.classList.remove(`visually-hidden`);
    }
  }

  hide() {
    const element = this.getElement();
    if (!element.classList.contains(`visually-hidden`)) {
      element.classList.add(`visually-hidden`);
    }
  }
}
