import {COLORS, MONTHS} from "../utils/constant";

const DESCRIPTIONS = [
  `Изучить теорию`,
  `Сделать домашку`,
  `Пройти интенсив на соточку`,
];

const DEFAULT_REPEATING_DAYS = {
  "mo": false,
  "tu": false,
  "we": false,
  "th": false,
  "fr": false,
  "sa": false,
  "su": false,
};

const generateRepeatingDays = () => {
  return Object.assign({}, DEFAULT_REPEATING_DAYS, {
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
    id: new Date().getTime() + getRandomNumber(1, 10000),
    repeatingDays: dueDate ? DEFAULT_REPEATING_DAYS : generateRepeatingDays(),
    dueDate,
    description: getRandomItemFromArray(DESCRIPTIONS),
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
  const date = dueDate ? `${dueDate.getDate()} ${MONTHS[dueDate.getMonth()]}` : ``;
  const repeatClass = repeatingDays.length > 0 ? ` card--repeat` : ``;
  const deadlineClass = dueDate instanceof Date && dueDate < Date.now() ? ` card--deadline` : ``;
  const archiveButtonInactiveClass = isArchive ? ` card__btn--disabled` : ``;
  const favoriteButtonInactiveClass = isFavorite ? ` card__btn--disabled` : ``;

  return {date, repeatClass, deadlineClass, archiveButtonInactiveClass, favoriteButtonInactiveClass};
};

export {generateTasks, getTaskTemplateData};
