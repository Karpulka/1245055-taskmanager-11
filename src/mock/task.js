import {COLORS} from "../constant";

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

export {generateTasks};
