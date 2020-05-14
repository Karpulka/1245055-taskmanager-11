import moment from "moment";

const formatTime = (date) => {
  return moment(new Date(date)).format(`hh:mm`);
};

const formatDate = (date) => {
  return moment(new Date(date)).format(`DD MMMM`);
};

const isRepeating = (repeatingDays) => {
  return Object.values(repeatingDays).some(Boolean);
};

const isOverdueDate = (dueDate, date) => {
  return dueDate < date && !isOneDay(date, dueDate);
};

const isOneDay = (dateA, dateB) => {
  const a = moment(dateA);
  const b = moment(dateB);
  return a.diff(b, `days`) === 0 && dateA.getDate() === dateB.getDate();
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export {formatTime, formatDate, isRepeating, isOverdueDate, isOneDay, getRandomNumber};
