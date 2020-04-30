import AbstractComponent from "./abstract-component";

const getNoTasksText = () => {
  return `<p class="board__no-tasks">
            Click «ADD NEW TASK» in menu to create your first task
          </p>`;
};

export default class NoTask extends AbstractComponent {
  getTemplate() {
    return getNoTasksText();
  }
}
