import {render, RenderPosition, replace} from "../utils/render";
import Filter from "../components/filter";
import {getTasksByFilter} from "../utils/filter";
import {FilterType} from "../utils/constant";

export default class FilterController {
  constructor(container, tasksModel) {
    this._container = container;
    this._tasksModel = tasksModel;
    this._currentFilterType = FilterType.ALL;
    this._tasks = this._tasksModel.getTasksAll();
    this._filterComponent = null;

    this._onFilterChange = this._onFilterChange.bind(this);
    this._onDataChange = this._onDataChange.bind(this);
    this._tasksModel.setDataChangeHandler(this._onDataChange());
  }

  render() {
    const filters = Object.values(FilterType).map((filterType) => {
      return {
        name: filterType,
        count: getTasksByFilter(this._tasks.slice(), filterType).length,
        checked: filterType === this._currentFilterType
      };
    });
    const oldFilterComponent = this._filterComponent;
    this._filterComponent = new Filter(filters);
    this._filterComponent.setChangeClickHandler(this._onFilterChange);
    if (oldFilterComponent) {
      replace(this._filterComponent, oldFilterComponent);
    } else {
      render(this._container, this._filterComponent, RenderPosition.AFTEREND);
    }
  }

  _onFilterChange(evt) {
    this._currentFilterType = evt.target.getAttribute(`data-name`);
    this._tasksModel.setFilter(this._currentFilterType);
  }

  _onDataChange() {
    this.render();
  }
}
