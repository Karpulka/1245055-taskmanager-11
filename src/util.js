const RenderPosition = {
  BEFOREBEGIN: `beforebegin`,
  BEFOREEND: `beforeend`,
  AFTERBEGIN: `afterbegin`,
  AFTEREND: `afterend`
};

const castTimeFormat = (value) => {
  return value < 10 ? `0${value}` : String(value);
};

const formatTime = (date) => {
  const hours = castTimeFormat(date.getHours() % 12);
  const minutes = castTimeFormat(date.getMinutes());

  return `${hours}:${minutes}`;
};

const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;

  return newElement.firstChild;
};

const render = (container, element, position) => {
  switch (position) {
    case RenderPosition.BEFOREBEGIN:
      container.before(element);
      break;
    case RenderPosition.BEFOREEND:
      container.append(element);
      break;
    case RenderPosition.AFTERBEGIN:
      container.prepend(element);
      break;
    case RenderPosition.AFTEREND:
      container.after(element);
      break;
  }
};

export {formatTime, createElement, render, RenderPosition};
