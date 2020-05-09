import AbstractComponent from "./abstract-component";

const createFilterMarkup = (filter) => {
  const {name, count, checked} = filter;

  return (
    `<input
      type="radio"
      id="filter__${name}"
      class="filter__input visually-hidden"
      name="filter"
      data-name="${name}"
      ${checked ? `checked` : ``}
      ${count === 0 ? `disabled` : ``}
    />
    <label for="filter__${name}" class="filter__label">
      ${name} <span class="filter__${name}-count">${count}</span></label
    >`
  );
};

const createFilterTemplate = (filters) => {
  const filtersMarkup = filters.map((filter) => createFilterMarkup(filter)).join(`\n`);

  return `<section class="main__filter filter container">${filtersMarkup}</section>`;
};

export default class Filter extends AbstractComponent {
  constructor(filters) {
    super();
    this._filters = filters;
  }

  getTemplate() {
    return createFilterTemplate(this._filters);
  }

  setChangeClickHandler(handler) {
    this.getElement().querySelectorAll(`[name="filter"]`).forEach((inputFilter) => {
      inputFilter.addEventListener(`change`, handler);
    });
  }
}
