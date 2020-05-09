import moment from "moment";

const formatTime = (date) => {
  return moment(new Date(date)).format(`hh:mm`);
};

const formatDate = (date) => {
  return moment(new Date(date)).format(`DD MMMM`);
};

export {formatTime, formatDate};
