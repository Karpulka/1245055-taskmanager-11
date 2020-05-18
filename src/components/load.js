import AbstractComponent from "./abstract-component";

const getLoadText = () => {
  return `<p class="board__no-tasks">
            Loading...
          </p>`;
};

export default class Load extends AbstractComponent {
  getTemplate() {
    return getLoadText();
  }
}
