import {COLORS, MONTH_NAMES} from "../constant";
import {formatTime} from "../util";

const DescriptionItems = [
  `Изучить теорию`,
  `Сделать домашку`,
  `Пройти интенсив на соточку`,
];

const DefaultRepeatingDays = {
  "mo": false,
  "tu": false,
  "we": false,
  "th": false,
  "fr": false,
  "sa": false,
  "su": false,
};

const generateRepeatingDays = () => {
  return Object.assign({}, DefaultRepeatingDays, {
    "mo": Math.random() > 0.5,
  });
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const getRandomItemFromArray = (array) => {
  const min = 0;
  const max = array.length;
  return array[getRandomNumber(min, max)];
};

const getDueDate = () => {
  const currentDate = new Date();
  const sign = Math.random() > 0.5 ? 1 : -1;
  currentDate.setDate(currentDate.getDate() + sign * getRandomNumber(0, 7));
  return currentDate;
};

const generateTask = () => {
  const dueDate = Math.random() > 0.5 ? null : getDueDate();

  return {
    repeatingDays: dueDate ? DefaultRepeatingDays : generateRepeatingDays(),
    dueDate,
    description: getRandomItemFromArray(DescriptionItems),
    color: getRandomItemFromArray(COLORS),
    isArchive: Math.random() > 0.5,
    isFavorite: Math.random() > 0.5
  };
};

const generateTasks = (count) => {
  return new Array(count)
    .fill(``)
    .map(generateTask);
};

const getTaskTemplateData = (task) => {
  const {repeatingDays, dueDate, isArchive, isFavorite} = task;
  const date = dueDate ? `${dueDate.getDate()} ${MONTH_NAMES[dueDate.getMonth()]}` : ``;
  const time = dueDate ? formatTime(dueDate) : ``;
  const repeatClass = repeatingDays.length > 0 ? ` card--repeat` : ``;
  const deadlineClass = dueDate instanceof Date && dueDate < Date.now() ? ` card--deadline` : ``;
  const archiveButtonInactiveClass = isArchive ? `` : ` card__btn--disabled`;
  const favoriteButtonInactiveClass = isFavorite ? `` : ` card__btn--disabled`;

  return {date, time, repeatClass, deadlineClass, archiveButtonInactiveClass, favoriteButtonInactiveClass};
};

export {generateTasks, getTaskTemplateData};
