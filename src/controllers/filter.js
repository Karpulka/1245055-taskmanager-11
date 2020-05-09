import {render, RenderPosition} from "../utils/render";
import Filter from "../components/filter";
import {isOverdueDate, isRepeating, isOneDay} from "../utils/common";
import {FilterType} from "../utils/constant";

export default class FilterController {
  constructor(container, tasksModel) {
    this._container = container;
    this._tasksModel = tasksModel;
    this._currentFilterType = FilterType.ALL;
    this._tasks = [];
    this._nowDate = new Date();
  }

  render() {
    this._tasks = this._tasksModel.getTasksAll();
    const filters = Object.values(FilterType).map((filterType) => {
      return {
        name: filterType,
        count: this._getTasksByFilter(filterType).length,
        checked: filterType === this._currentFilterType
      };
    });
    render(this._container, new Filter(filters), RenderPosition.AFTEREND);
  }

  _getTasksByFilter(filterType) {
    const tasks = this._tasks.slice();
    const notArchiveTasks = this._getNotArchiveTasks(tasks);
    switch (filterType) {
      case FilterType.ALL:
        return notArchiveTasks;
      case FilterType.ARCHIVE:
        return this._getArchiveTasks(tasks);
      case FilterType.FAVORITES:
        return this._getFavoriteTasks(notArchiveTasks);
      case FilterType.OVERDUE:
        return this._getOverdueTasks(notArchiveTasks);
      case FilterType.REPEATING:
        return this._getRepeatingTasks(notArchiveTasks);
      case FilterType.TODAY:
        return this._getTasksInOneDay(notArchiveTasks);
    }

    return tasks;
  }

  _getArchiveTasks(tasks) {
    return tasks.filter((task) => task.isArchive);
  };

  _getNotArchiveTasks(tasks) {
    return tasks.filter((task) => !task.isArchive);
  };

  _getFavoriteTasks(tasks) {
    return tasks.filter((task) => task.isFavorite);
  }

  _getOverdueTasks(tasks) {
    return tasks.filter((task) => {
      const dueDate = task.dueDate;

      if (!dueDate) {
        return false;
      }

      return isOverdueDate(dueDate, this._nowDate);
    });
  }

  _getRepeatingTasks(tasks) {
    return tasks.filter((task) => isRepeating(task.repeatingDays));
  }

  _getTasksInOneDay(tasks) {
    return tasks.filter((task) => isOneDay(task.dueDate, this._nowDate));
  }
}
