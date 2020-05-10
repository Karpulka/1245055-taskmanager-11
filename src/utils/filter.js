import {FilterType} from "./constant";
import {isOneDay, isOverdueDate, isRepeating} from "./common";

const getTasksByFilter = (tasks, filterType) => {
  const date = new Date();
  const notArchiveTasks = getNotArchiveTasks(tasks);
  switch (filterType) {
    case FilterType.ALL:
      return notArchiveTasks;
    case FilterType.ARCHIVE:
      return getArchiveTasks(tasks);
    case FilterType.FAVORITES:
      return getFavoriteTasks(notArchiveTasks);
    case FilterType.OVERDUE:
      return getOverdueTasks(notArchiveTasks, date);
    case FilterType.REPEATING:
      return getRepeatingTasks(notArchiveTasks);
    case FilterType.TODAY:
      return getTasksInOneDay(notArchiveTasks, date);
  }

  return tasks;
};

const getArchiveTasks = (tasks) => {
  return tasks.filter((task) => task.isArchive);
};

const getNotArchiveTasks = (tasks) => {
  return tasks.filter((task) => !task.isArchive);
};

const getFavoriteTasks = (tasks) => {
  return tasks.filter((task) => task.isFavorite);
};

const getOverdueTasks = (tasks, date) => {
  return tasks.filter((task) => {
    const dueDate = task.dueDate;

    if (!dueDate) {
      return false;
    }

    return isOverdueDate(dueDate, date);
  });
};

const getRepeatingTasks = (tasks) => {
  return tasks.filter((task) => isRepeating(task.repeatingDays));
};

const getTasksInOneDay = (tasks, date) => {
  return tasks.filter((task) => isOneDay(task.dueDate, date));
};

export {getTasksByFilter};
